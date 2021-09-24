import { useState, useEffect, useCallback, useRef } from 'react'
import ToAddList from '../components/ToAddList';
import OverwriteCartToggle from '../components/OverwriteCartToggle';
import ToAddInput from '../components/ToAddInput';
import { ITEM_LOOKUP, ITEM_LOOKUP_RESP } from '../MessageTypes'

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

const getCookie = async (setCookie, setTab) => {
  browser.cookies.get({
    name: "ransu",
    url: "https://www.amiami.com",
  }).then(cookie => {

    browser.tabs.query({
      url: "*://*.amiami.com/*"
    }).then(tabs => {
      // console.log({ tabs })
      // const payload = {
      //   ADD_TO_CART: {
      //     ransu: cookie.value,
      //     scode: "FIGURE-131178",
      //   }
      // };

      if (!tabs[0].active) {
        console.log("NOT ACTIVE TAB")
        return;
      }
      setTab(tabs[0]);

      // console.log("sending message: ", payload);
      // chrome.tabs.sendMessage(tabs[0].id, payload);
      browser.runtime.onMessage.addListener(msg => {
        console.log({ msg });
        if (msg.cookieUpdate) {
          setCookie(msg.cookieUpdate);
        }
      });
    }).catch(err => console.error(err));
    console.log({ cookie });
    if (cookie) {

      // myPort.postMessage({
      //   // from: "POPUP",
      //   // payload: {
      //   //   message: "ADD_TO_CART",
      //   // },
      //   ADD_TO_CART: {
      //     ransu: cookie.value,
      //     scode: "FIGURE-131178",
      //   }
      // })
      setCookie(cookie.value);
    }
  }).catch(err => {
    console.error(err);
    setCookie(err.message);
  });
};

const savedItems = {
  get: async () => {
    const { items } = await browser.storage.local.get('items');
    return items;
  },
  set: (items) => {
    return browser.storage.local.set({ items, });
  }
}

export default function App() {
  console.count("APP RENDER");

  const [items, setItems] = useState([
    // {
    //   url: "https://www.amiami.com/eng/detail/?gcode=GOODS-04152310",
    //   amt: 1,
    //   thumb: "https://img.amiami.com/images/product/main/213/GOODS-04152310.jpg",
    //   name: "[Bonus] Touhou Plush Series 17 Kaguya Houraisan Fumofumo Kaguya.(Pre-order)",
    //   loaded: true,
    // }
  ]);
  console.log({
    items,
  })
  const [cookie, setCookie] = useState('Loading');
  const [tab, setTab] = useState(null);

  const sendMessage = (msg) => {
    if (!tab) {
      console.log("Trying to send message, but tab is null");
      return;
    }
    console.log("SENDING MESSAGE: \n" + JSON.stringify(msg, null, 2));
    chrome.tabs.sendMessage(tab.id, msg);
  };

  const addPendingItem = ({ scode, amt }) => {
    setItems([
      ...items,
      {
        scode,
        amt,
      }
    ]);
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
  const isFirstRun = useRef(true);
  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    console.log("ITEMS CHANGED IN SAVE HOOK");
    (async () => {
      if (items.every(item => item.loaded)) {
        console.log("Saving Items " + items.length);

        // savedItems.set(items).then(() => console.log("SAVED"))
      }
    })();
  }, [items, isFirstRun]);

  useEffect(() => {
    (async () => {
      console.log("LOADING ITEMS")
      const loadedItems = await savedItems.get();

      console.log({ loadedItems });

      if (!loadedItems) {
        await savedItems.set([]);
      } else {
        setItems(loadedItems)
      }

    })();

    getCookie(setCookie, setTab);

    const unsub = messageList.sub({
      key: ITEM_LOOKUP_RESP,
      hook: resp => updatePendingToLoadedItem(resp)
    })

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
    ></ToAddList>
    <OverwriteCartToggle />

  </div>;
}
