import { createGlobalStyle } from 'styled-components';

import sanitizeAssets from './sanitize-assets';
import sanitizeCss from './sanitize-css';
import sanitizeForms from './sanitize-forms';
import sanitizeTypography from './sanitize-typography';

export default createGlobalStyle`
  ${sanitizeCss}
  ${sanitizeAssets}
  ${sanitizeForms}
  ${sanitizeTypography}
`;
