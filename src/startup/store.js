import { createStore, applyMiddleware, compose } from "redux";
import { routerMiddleware } from "react-router-redux";
import thunk from "redux-thunk";
import createHistory from "history/createBrowserHistory";

import rootReducer from "reducers";
import { loadState } from "startup/localStorage";

export const history = createHistory();
//const initialState = loadState();
let initialState;

const enhancers = [];
const middleware = [thunk, routerMiddleware(history)];

if (process.env.NODE_ENV === "development") {
  const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

  if (typeof devToolsExtension === "function") {
    enhancers.push(devToolsExtension());
  }
}

var url = window.location.pathname;
var urlArray = url.split("/");

if (initialState && urlArray) {
  //var defaultPage = urlArray[1];
  initialState.general.page = url;
}

const composedEnhancers = compose(applyMiddleware(...middleware), ...enhancers);

export default createStore(rootReducer, initialState, composedEnhancers);
