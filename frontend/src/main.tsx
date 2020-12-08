// NOTE: Due to the fact that components using Styled Components generally read
// the `__webpack_nonce__` variable during module initialization,
// './webpack-nonce' needs to be imported BEFORE 'frontend-lib'.
import './webpack-nonce';
import Main, { BootstrapData } from 'frontend-lib';
import React from 'react';
import ReactDOM from 'react-dom';

declare global {
  interface Window {
    bootstrapData: BootstrapData;
    nonce: string;
  }
}

ReactDOM.hydrate(
  <Main bootstrapData={window.bootstrapData} />, // [ref:window_bootstrap_data]
  document.getElementById('root'),
);
