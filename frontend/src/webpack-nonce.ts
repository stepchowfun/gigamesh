// This line indicates that the file is a module. Without it, we'd encounter
// TypeScript error TS2669.
export {};

declare global {
  interface Window {
    nonce: string;
  }

  // See the following pages for an explanation of this magic variable:
  // - https://webpack.js.org/guides/csp/
  // - https://github.com/styled-components/styled-components/issues/887
  // eslint-disable-next-line no-underscore-dangle, camelcase
  let __webpack_nonce__: string;
}

// eslint-disable-next-line camelcase, no-undef
__webpack_nonce__ = window.nonce;
