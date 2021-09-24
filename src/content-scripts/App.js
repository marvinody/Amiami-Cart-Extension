/* eslint-disable no-console */
// import Demo from "../components/Demo";

// let myPort = browser.runtime.connect({ name: "port-from-cs" });
// myPort.postMessage({ from: "CONTENT", payload: { message: "hello" } });

// myPort.onMessage.addListener(function (m) {
//   console.log(`In content script, received message from background script: "${m.payload.message}"`);
// });

// browser.cookies.get({
//   name: "ransu",
//   url: "https://www.amiami.com",
// }).then(cookie => {
//   console.log({ cookie });
// })

import { ITEM_LOOKUP, ITEM_LOOKUP_RESP } from '../MessageTypes'


const addToCart = ({ ransu, scode }) => {
  console.log({ ransu, scode });
  // eslint-disable-next-line no-undef
  content.fetch('https://api.amiami.com/api/v1.0/cart', {
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
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(err => console.error(err));
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
      }
    })
    .catch(err => {
      console.error(err);
      return {
        scode,
        err: err.message,
      }
    })
    .then(resp => {
      console.log("SENDING " + ITEM_LOOKUP_RESP + JSON.stringify(resp, null, 2));
      browser.runtime.sendMessage({
        [ITEM_LOOKUP_RESP]: resp
      });
    })
}

// eslint-disable-next-line no-undef
browser.runtime.onMessage.addListener(message => {
  console.log(message, Boolean(message.ADD_TO_CART), Boolean(message[ITEM_LOOKUP]),);


  if (message.ADD_TO_CART) {
    console.log("ADDING TO CART");
    // addToCart(message.ADD_TO_CART)
    browser.runtime.sendMessage({
      cookieUpdate: "NEW COOKIE VALUE"
    });
  } else if (message[ITEM_LOOKUP]) {
    console.log(`LOOKING UP ITEM: ${message[ITEM_LOOKUP]}`)
    lookupItem({ scode: message[ITEM_LOOKUP] })
  }
})

function App() {
  // return <Demo/>;
  console.log("CONTENT SCRIPT");
  return 'yowatup';
}
export default App;
