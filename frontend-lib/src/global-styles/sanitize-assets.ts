import { css } from 'styled-components';

/*
  The CSS in this file is from https://github.com/csstools/sanitize.css.
*/

export default css`
  /**
   * Restrict sizing to the page width in all browsers (opinionated).
   */

  iframe,
  img,
  input,
  select,
  textarea {
    height: auto;
    max-width: 100%;
  }
`;
