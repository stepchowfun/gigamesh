import Main, { BootstrapData } from 'frontend-lib';
import React from 'react';
import ReactDOM from 'react-dom';

declare global {
  interface Window {
    bootstrapData: BootstrapData;
  }
}

ReactDOM.hydrate(
  <Main bootstrapData={window.bootstrapData} />,
  document.getElementById('root'),
);
