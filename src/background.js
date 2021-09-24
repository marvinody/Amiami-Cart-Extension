// import "@babel/polyfill";
// import chromeService from "./services/chromeService";
// import constants from "../constants";
// import db from "./services/dbService";
// import schema from "./services/schema";
// import Routes from "./routes";


// let AppInitState = 0; // it means app is off on startup

// /**
//  * Main extension functionality
//  *
//  * @class Main
//  */
// class Main {
//   constructor() {
//     // set feedback form url
//     this.setFeedbackFormUrl();
//     this.init().catch(() => {});
//   }

//   init = async () => {
//     await this.initDb();
//     this.popUpClickSetup();
//     await Routes();
//   };
//   /**
//    * initialize db settings
//    * @method
//    * @memberof Main
//    */
//   initDb = async () => {
//     const res = await db.get("_loaded");
//     if (!res.hasOwnProperty("_loaded")) {
//       await db.set({ _loaded: true, ...schema.data });
//       chromeService.openHelpPage("welcome");
//     }
//   };
//   popUpClickSetup() {
//     chrome.browserAction.onClicked.addListener(() => {
//       if (this.toggleApp()) {
//         // chromeService.openHelpPage("");
//       } else {
//         this.stopApp();
//       }
//     });
//   }
//   /**
//    * toggle app
//    *
//    * @method
//    * @memberof Main
//    */
//   toggleApp = () => {
//     AppInitState = AppInitState ? 0 : 1;
//     return AppInitState;
//   };
//   /**
//    * stop app
//    *
//    * @method
//    * @memberof Main
//    */
//   stopApp = () => {
//     AppInitState = 0;
//   };
//   /**
//    *set feedback form url shown while uninstalling
//    * */
//   setFeedbackFormUrl = () => {
//     chrome.runtime.setUninstallURL(constants.support.uninstallFeedbackForm);
//   };
// }

// new Main();


// let portFromCS;

// console.log("content.fetch")
// console.log(content.fetch)

// function connected(p) {
//   portFromCS = p;
//   portFromCS.postMessage({ greeting: "hi there content script!" });
//   portFromCS.onMessage.addListener(function (m) {
//     console.log("BACKGROUND CAUGHT:", JSON.stringify(m));
//     if(m.from) {
//       portFromCS.postMessage(m);
//     }
//     if(m.ADD_TO_CART) {
//       addToCart(m.ADD_TO_CART);
//     }
//     // portFromCS.postMessage({ greeting: "In background script, received message from content script:" + m.greeting });
//   });
// }

// browser.runtime.onConnect.addListener(connected);

// browser.browserAction.onClicked.addListener(function() {
//   portFromCS.postMessage({greeting: "they clicked the button!"});
// });
