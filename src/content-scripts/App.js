/* eslint-disable no-console */
// import Demo from "../components/Demo";

// let myPort = browser.runtime.connect({ name: "port-from-cs" });
// myPort.postMessage({ from: "CONTENT", payload: { message: "hello" } });

// myPort.onMessage.addListener(function (m) {
//   console.log(`In content script, received message from background script: "${m.payload.message}"`);
// });


import {
  ITEM_LOOKUP, ITEM_LOOKUP_RESP, ADD_TO_REAL_CART, ADD_TO_REAL_CART_RESP, UPDATE_COOKIE
} from '../MessageTypes';






const addToCart = ({ ransu, scode }) => {
  console.log({ ransu, scode });
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
      amount: 1,
    })
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

const handleCartAdd = async ({ items, config, ransu }) => {

  console.log("HANDLE CART ADD");
  console.log({ items });


  const metaItems = items.map(item => ({
    item,
    meta: {
      attempts: 0,
      statuses: [],
    }
  }));

  const finishedItems = [];


  while (metaItems.length > 0) {
    const { item, meta } = metaItems.pop();
    meta.attepts += 1;

    const { status, data } = await addToCart({ scode: item.scode, ransu });

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
          meta,
        });
        continue;
      }

      // which statuses do we retry?
      // 200s with failing Rsuc/Rmsg means stock issues maybe? so not that
      // 400 probably won't get us fixed next try, so let's not
      // 500 makes sense since probably server error
      if (status >= 500) {
        metaItems.push({
          item, meta
        });
      } else {
        // 2xx, 4xx
        finishedItems.push({
          item,
          meta,
        });
      }

    } else { // success
      finishedItems.push({
        item,
        meta
      });
    }

    if (data?.session?.ransu) {
      ransu = data.session.ransu;
    }
  }



  console.log(finishedItems);
  browser.runtime.sendMessage({
    [UPDATE_COOKIE]: ransu
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
      console.log("SENDING " + ITEM_LOOKUP_RESP + JSON.stringify(resp, null, 2));
      browser.runtime.sendMessage({
        [ITEM_LOOKUP_RESP]: resp
      });
    });
};

browser.runtime.onMessage.addListener(message => {
  console.log(message, Boolean(message.ADD_TO_CART), Boolean(message[ITEM_LOOKUP]),);


  if (message.ADD_TO_CART) {
    console.log("ADDING TO CART");
    // addToCart(message.ADD_TO_CART)
    browser.runtime.sendMessage({
      cookieUpdate: "NEW COOKIE VALUE"
    });
  } else if (message[ITEM_LOOKUP]) {
    console.log(`LOOKING UP ITEM: ${message[ITEM_LOOKUP]}`);
    lookupItem({ scode: message[ITEM_LOOKUP] });
  } else if (message[ADD_TO_REAL_CART]) {
    handleCartAdd(message[ADD_TO_REAL_CART]);
  }
});

function App() {
  // return <Demo/>;
  console.log("CONTENT SCRIPT");
  return 'yowatup';
}
export default App;
