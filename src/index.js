import 'babel-polyfill';
import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import throttle from 'lodash/throttle';
import Button from 'react-bootstrap/Button';

import { RedoAltIcon } from "react-line-awesome";

import registerServiceWorker from './startup/registerServiceWorker';

import App from './app';
import store, { history } from './startup/store';
import { saveState } from './startup/localStorage';
import { GetUrlParam } from "common/helpers";

import actions from "actions";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'sanitize.css/sanitize.css';
import 'semantic-ui-css/semantic.min.css';

const { creators } = actions;

history.listen(location => {
  window.location = location.pathname;
});

store.subscribe(
  throttle(() => {
    //saveState(store.getState());
  }, 1000)
);

render(
  <Provider store={store}>
    <ConnectedRouter history={history}
    >     
      <App />
    </ConnectedRouter>
  </Provider>,
  document.querySelector('#root')
);

//const { creators } = actions;
//registerServiceWorker(store, creators);
registerServiceWorker();