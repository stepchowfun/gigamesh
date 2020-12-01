import { createGlobalStyle } from 'styled-components';

import sanitizeAssets from './sanitize-assets';
import sanitizeCss from './sanitize-css';
import sanitizeForms from './sanitize-forms';
import sanitizeTypography from './sanitize-typography';

// Sadly, `babel-plugin-styled-components` isn't minimizing this string for
// some reason. So we manually "minify" it just by not having any whitespace
// in it.
export default createGlobalStyle`${sanitizeCss}${sanitizeAssets}${sanitizeForms}${sanitizeTypography}`;
