import { useState, useEffect, useRef } from 'react';
import ToAddList from '../components/ToAddList';
import GenericToggle from '../components/GenericToggle';
import SubmitCartButton from '../components/SubmitCartButton';
import ToAddInput from '../components/ToAddInput';
import {
  ITEM_LOOKUP_RESP,
  ADD_TO_REAL_CART,
  CART_STATE_LOOKUP, CART_STATE_LOOKUP_RESP,
  UPDATE_COOKIE, UPDATE_COOKIE_RESP,
} from '../MessageTypes';
import { useCallback } from 'react';

const defaultConfig = {
  overwriteCart: true,
  retryOnServerError: true,
  loadCartPageOnDone: true,
};

const messageList = (() => {

  let listeners = [];

  browser.runtime.onMessage.addListener(msg => {
    listeners.forEach(({ hook, key }) => {
      if (!key) {
        hook(msg);
      }

      if (key && msg[key]) {
        hook(msg[key]);
      }
    });
  });

  return {

    sub: ({ hook, key }) => {
      listeners.push({
        hook, key
      });

      // unsub func
      return () => {
        listeners = listeners.filter(l => l.hook !== hook);
      };
    }
  };

})();

const getRansuCookie = () => browser.cookies.get({
  name: "ransu",
  url: "https://www.amiami.com",
}).then(cookie => cookie?.value);

const setRansuCookie = (ransu) => browser.cookies.set({
  name: "ransu",
  domain: ".amiami.com",
  url: "https://www.amiami.com",
  expirationDate: Date.now() + 31557600, // 1 year from now
  value: ransu,
});

// time based & rng, good enough snowflake
const generateRansu = () => `extT${Date.now()}RNG${Math.random().toString().slice(2, -5)}`;

const getTab = async (setTab) => {
  browser.tabs.query({
    url: "*://*.amiami.com/*"
  }).then(tabs => {
    // this is required to make sure we can use GET requests on this tab
    const activeTab = tabs.find(tab => tab.active);

    if (!activeTab) {
      return;
    }
    setTab(activeTab);
  }).catch(err => console.error(err));
};

const localStorageMaker = (name) => ({
  get: async () => {
    const data = await browser.storage.local.get(name);
    return data[name];
  },
  set: (items) => {
    return browser.storage.local.set({ [name]: items, });
  }
});

const savedItems = localStorageMaker('items');
const savedConfig = localStorageMaker('userConfig');

export default function App() {

  const [items, setItems] = useState([]);

  const [tab, setTab] = useState(null);

  const [cartState, setCartState] = useState({
    done: false,
    items: [],
  });
  const [config, setConfig] = useState(defaultConfig);

  const configSetter = (key) => (value) => setConfig(conf => {
    const newConfig = { ...conf, [key]: value };
    savedConfig.set(newConfig);
    return newConfig;
  });

  const msgBuffer = useRef([]);

  const sendMessage = useCallback((msg) => {
    if (!tab) {
      console.log("Trying to send message, but tab is null; Adding to buffer");
      msgBuffer.current.push(msg);
      return;
    }
    chrome.tabs.sendMessage(tab.id, msg);
  }, [tab]);

  // Submit buffer to tab if we detect one
  useEffect(() => {
    console.log("Tab changed, sending old buffer maybe:", Boolean(tab));
    if(tab && msgBuffer.current.length > 0) {
      msgBuffer.current.forEach(msg => sendMessage(msg));
      msgBuffer.current = [];
    }
  }, [tab]);

  // resolves a promise of IsNewItem to know if you should trigger a data lookup
  const addPendingItem = ({ scode, amt }) => {
    return new Promise((resolve) => {
      setItems(currentItems => {
        const itemExists = currentItems.find(item => item.scode === scode);
        if (itemExists) {
          resolve(false);
          return currentItems.map(item => {
            if (item.scode === scode) {
              return {
                ...item,
                amt: Math.min(item.amt + amt, 3),
              };
            }
            return item;
          });
        }
        resolve(true);
        return [
          ...currentItems,
          {
            scode,
            amt,
          }
        ];
      });
    });
  };

  const updatePendingToLoadedItem = ({ scode, data, }) => {
    setItems(currentItems => currentItems.map(item => {
      if (item.scode === scode) {
        return {
          ...item,
          loaded: true,
          scode,
          thumb: `https://img.amiami.com${data.item.thumb_url}`,
          name: data.item.sname,
          url: `https://www.amiami.com/eng/detail/?gcode=${data.item.gcode}`
        };
      }
      return item;
    })
    );
  };

  const removeItem = ({ scode }) => {
    setItems(currentItems => currentItems.filter(item => item.scode !== scode));
  };

  const submitItemsToAmiami = async () => {
    let ransu = null;
    if (config.overwriteCart) {
      ransu = generateRansu();
    } else {
      ransu = await getRansuCookie();
      if (!ransu) { // it may not be set anyway
        ransu = generateRansu();
      }
    }

    sendMessage({
      [ADD_TO_REAL_CART]: {
        items,
        config,
        ransu,
      }
    });
  };

  // Cookie (ransu) subscribe
  useEffect(() => {
    const unsub = messageList.sub({
      key: UPDATE_COOKIE,
      hook: async (ransu) => {
        await setRansuCookie(ransu);

        // we should only receive the update cookie event once
        // the add part finishes. so we can assume that we only want
        // to reload the page after cookie setting is done
        if(config.loadCartPageOnDone) {
          sendMessage({
            [UPDATE_COOKIE_RESP]: true,
          });
        }
      }
    });

    return unsub;
  }, [sendMessage]);

  // Cart State subscriber & initial lookup
  useEffect(() => {
    const unsub = messageList.sub({
      key: CART_STATE_LOOKUP_RESP,
      hook: cartState => {
        setCartState(cartState);
      }
    });

    sendMessage({
      [CART_STATE_LOOKUP]: true,
    });

    return unsub;
  }, [sendMessage]);


  // Items saver
  const isFirstRun = useRef(true);
  const hasLoadedItems = useRef(false);
  useEffect(() => {
    // I'm not super happy about this but we need a way to not trigger
    // a save to memory unless after the first render and we've loaded once
    // this works for now
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    if (hasLoadedItems.current) {
      hasLoadedItems.current = false;
      return;
    }

    (async () => {
      if (items.every(item => item.loaded)) {
        await savedItems.set(items);
      }
    })();
  }, [items, isFirstRun]);

  useEffect(() => {
    (async () => {
      const loadedItems = await savedItems.get();
      hasLoadedItems.current = true;

      if (!loadedItems) {
        await savedItems.set([]);
      } else {
        setItems(loadedItems);
      }

      const loadedConfig = await savedConfig.get();
      if (!loadedConfig) {
        await savedConfig.set(config);
      } else {
        setConfig(loadedConfig);
      }

    })();

    getTab(setTab);

    const unsub = messageList.sub({
      key: ITEM_LOOKUP_RESP,
      hook: resp => updatePendingToLoadedItem(resp)
    });

    return unsub;
  }, [setItems]);



  return <div className='flex flex-col p-6 px-4'>
    <div className='text-lg font-semibold mx-auto'>
      <span>Amiami Cart Adder</span>
    </div>

    <div className='text-md font-semibold mx-auto text-red-500'>
      <span>{tab ? "" : "Open this on an Amiami page"}</span>
    </div>

    <ToAddInput
      sendMessage={sendMessage}
      activeTab={Boolean(tab)}
      addPendingItem={addPendingItem}
    ></ToAddInput>
    <ToAddList
      items={items}
      cartState={cartState}
      removeItem={removeItem}
    ></ToAddList>

    <GenericToggle
      currentState={config.overwriteCart}
      setCurrentState={configSetter('overwriteCart')}
      text="Overwrite Existing Cart"
    />
    <GenericToggle
      currentState={config.retryOnServerError}
      setCurrentState={configSetter('retryOnServerError')}
      text="Retry Adding on Server Error"
    />
    <GenericToggle
      currentState={config.loadCartPageOnDone}
      setCurrentState={configSetter('loadCartPageOnDone')}
      text="Load Cart Page When Done"
    />
    <SubmitCartButton
      noItems={items.length === 0}
      activeTab={Boolean(tab)}
      onClick={submitItemsToAmiami}
    />

  </div>;
}
