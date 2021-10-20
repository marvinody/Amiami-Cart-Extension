import {
  ITEM_LOOKUP, ITEM_LOOKUP_RESP,
  ADD_TO_REAL_CART,
  UPDATE_COOKIE, UPDATE_COOKIE_RESP,
  CART_STATE_LOOKUP, CART_STATE_LOOKUP_RESP
} from '../MessageTypes';

import ITEM_META_STATE from '../ItemMetaStates';

const gotoCartPart = () => {
  document.location.href = 'https://www.amiami.com/eng/cart/';
};

const addToCart = ({ ransu, scode, amount }) => {
  return content.fetch('https://api.amiami.com/api/v1.0/cart', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      "X-User-Key": "amiami_dev",
      "Origin": "https://www.amiami.com",
    },
    body: JSON.stringify({
      lang: "eng",
      age_confirm: null,
      mcode: null,
      scode,
      ransu,
      amount,
    }),
  })
    .then(async response => {
      return {
        status: response.status,
        data: await response.json(),
      };

    })
    .catch(err => (console.error(err), err));
};

const MAX_ATTEMPTS = 5;

const mapState = (state) => {
  return {
    done: state.done,
    items: [
      state.inProgressItem,
      ...state.metaItems,
      ...state.finishedItems,
    ].filter(item => Boolean(item))
  };
};

const sendState = (state) => {
  browser.runtime.sendMessage({
    [CART_STATE_LOOKUP_RESP]: mapState(state)
  });
};

const handleCartAdd = async ({ items, config, ransu }, state) => {

  const metaItems = items.map(item => ({
    item,
    meta: {
      attempts: 0,
      statuses: [],
      state: ITEM_META_STATE.PENDING
    }
  }));

  const finishedItems = [];

  state.done = false;
  state.metaItems = metaItems;
  state.finishedItems = finishedItems;
  state.inProgressItem = null;


  while (metaItems.length > 0) {
    state.inProgressItem = metaItems.pop();
    const { item, meta } = state.inProgressItem;

    meta.state = ITEM_META_STATE.IN_PROGRESS;

    meta.attempts += 1;

    sendState(state);

    const { status, data } = await addToCart({
      scode: item.scode,
      ransu,
      amount: item.amt
    });

    meta.statuses.push({
      status,
      RSuccess: data?.RSuccess,
      RMessage: data?.RMessage,
    });

    if (data?.RSuccess !== true || data?.RMessage !== "OK") {
      // probably a failure
      // let's see if we should retry
      if (meta.attempts > MAX_ATTEMPTS) {
        finishedItems.push({
          item,
          meta: {
            ...meta,
            state: ITEM_META_STATE.FAILED
          },
        });
        state.inProgressItem = null;
        sendState(state);
        continue;
      }

      // which http statuses do we retry?
      // 200s with failing Rsuc/Rmsg means stock issues maybe? so not that
      // 400 probably won't get us fixed next try, so let's not
      // 500 makes sense since probably server error
      if (status >= 500 && config.retryOnServerError) {
        metaItems.push({
          item, meta: {
            ...meta,
            state: ITEM_META_STATE.PENDING
          },
        });
      } else {
        // 2xx, 4xx
        finishedItems.push({
          item,
          meta: {
            ...meta,
            state: ITEM_META_STATE.FAILED
          },
        });
      }

    } else { // success
      finishedItems.push({
        item,
        meta: {
          ...meta,
          state: ITEM_META_STATE.SUCCESS
        },
      });
    }

    state.inProgressItem = null;
    sendState(state);

    if (data?.session?.ransu) {
      ransu = data.session.ransu;
    }
  }


  state.done = true;
  await browser.runtime.sendMessage({
    [UPDATE_COOKIE]: ransu,
    [CART_STATE_LOOKUP_RESP]: mapState(state),
  });
};

const lookupItem = ({ scode }) => {
  console.log(`Looking up "${scode}"`);
  content.fetch(`https://api.amiami.com/api/v1.0/item?scode=${encodeURIComponent(scode)}`, {

    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      "X-User-Key": "amiami_dev",
      "Origin": "https://www.amiami.com",
    },
  })
    .then(response => response.json())
    .then(data => {
      return {
        scode,
        data,
      };
    })
    .catch(err => {
      console.error(err);
      return {
        scode,
        err: err.message,
      };
    })
    .then(resp => {
      browser.runtime.sendMessage({
        [ITEM_LOOKUP_RESP]: resp
      });
    });
};

browser.runtime.onMessage.addListener(message => {

  // this is an ugly way to do this, but it'll work for now
  // this will act like a singleton and we'll pretend to only have one
  // if another cart add request comes in and we have one going, don't start new
  // This will also be our data to send to popup for it to inform user of current status
  // having a 'global' state lets us fully update user on fresh open
  let addCartState = {
    done: true,
  };


  // no elses is on purpose since this lets us send multiple actions in 1
  // message if needed later
  if (message[ITEM_LOOKUP]) {
    lookupItem({ scode: message[ITEM_LOOKUP] });
  }
  if (message[ADD_TO_REAL_CART]) {
    if(addCartState.done) { // prevent dupe submission
      // we're in progress then
      addCartState.done = false;
      handleCartAdd(message[ADD_TO_REAL_CART], addCartState);
    }
  }
  if (message[CART_STATE_LOOKUP]) {
    sendState(addCartState);
  }

  if(message[UPDATE_COOKIE_RESP]) {
    gotoCartPart();
  }


});

function App() {
  console.log("Amiami Cart Extension detected the site!");
  return '';
}
export default App;
