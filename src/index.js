/* eslint-disable */
require('dotenv').config();

import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'mobx-react';
import { rehydrate, hotRehydrate } from 'rfx-core';
import registerServiceWorker from './utils/registerServiceWorker';
import 'react-overlay-loader/styles.css';
import './styles/main.css';
import App from './App';
import './stores/stores';

const store = rehydrate();

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>,
  document.getElementById('root'),
);

registerServiceWorker();
