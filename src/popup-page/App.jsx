import { useState, useEffect } from 'react'
import ToAddList from '../components/ToAddList';
import OverwriteCartToggle from '../components/OverwriteCartToggle';
import { PlusCircleIcon } from '@heroicons/react/outline';

// let myPort = browser.runtime.connect({name:"port-from-cs"});
// myPort.postMessage({greeting: "hello from Popup script"});

// myPort.onMessage.addListener(function(m) {
//   console.log(`In Popup script, received message from background script: "${m.greeting}"`);
// });


const getCookie = async (set) => {
  browser.cookies.get({
    name: "ransu",
    url: "https://www.amiami.com",
  }).then(cookie => {

    browser.tabs.query({
      url: "*://*.amiami.com/*"
    }).then(tabs => {
      console.log({ tabs })
      const payload = {
        ADD_TO_CART: {
          ransu: cookie.value,
          scode: "FIGURE-131178",
        }
      }
      console.log("sending message: ", payload)
      chrome.tabs.sendMessage(tabs[0].id, payload);
      browser.runtime.onMessage.addListener(msg => {
        console.log({msg})
        if(msg.cookieUpdate) {
          set(msg.cookieUpdate)
        }
      })
    }).catch(err => console.error(err))
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
      set(cookie.value);
    }
  }).catch(err => {
    console.error(err);
    set(err.message);
  });
};

export default function App() {
  const [cookie, setCookie] = useState('Loading');
  useEffect(() => {
    getCookie(setCookie);
  }, [getCookie]);

  return <div className='flex flex-col p-6 px-4'>
    <span>{cookie}</span>
    <div className='text-lg font-semibold mx-auto'>
      <span>Amiami Cart Adder</span>
    </div>

    <div>
      <form>

        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Amiami URL</label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <div className="relative flex items-stretch flex-grow focus-within:z-10">
            <input type="text" name="email" id="email" className="focus:ring-indigo-500
          focus:border-indigo-500 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
              placeholder="https://www.amiami.com/eng/detail/?gcode=CGD-9540" />
          </div>
          <div className="inset-y-0 right-0 relative inline-flex items-center">
            <select id="amt" name="amt" className="focus:ring-indigo-500
            focus:border-indigo-500 border-gray-300 h-full py-0 pl-2 pr-7
            text-gray-500 sm:text-sm focus-within:z-10">
              <option>1</option>
              <option>2</option>
              <option>3</option>
            </select>
          </div>
          <button type="button" className="-ml-px relative inline-flex items-center space-x-2 px-4
        py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50
        hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-indigo-500
        focus:border-indigo-500">
            <PlusCircleIcon className="h-6 w-6" />
          </button>
        </div>
      </form>
    </div>
    <ToAddList></ToAddList>
    <OverwriteCartToggle />

  </div>;
}
