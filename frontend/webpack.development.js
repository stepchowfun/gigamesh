/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-var-requires */
const { merge } = require('webpack-merge');
const common = require('./webpack.common.js');

// Enable source maps for styles. We disable source maps in production because
// `style-loader` only supports inline source maps, which lead to bloat.
// However, that bloat is not as much of a concern in development.
const cssLoader = common.module.rules[1].use[1];
if (cssLoader.loader === 'css-loader') {
  cssLoader.options.sourceMap = true;
} else {
  throw new Error('Please update the `cssLoader` definition above.');
}

// For production, we configure `style-loader` to emit a single `<style>` tag,
// since it looks a little neater than the default behavior of having a separate
// `<style>` tag for each source file. Unfortunately this breaks source maps,
// but we disable source maps in production anyway as noted above. To enable
// source maps in development, we have to revert the behavior to generating a
// separate `<style>` tag for each source file.
const styleLoader = common.module.rules[1].use[0];
if (styleLoader.loader === 'style-loader') {
  styleLoader.options.injectType = 'styleTag';
} else {
  throw new Error('Please update the `styleLoader` definition above.');
}

module.exports = merge(common, {
  // Development mode
  mode: 'development',

  // Enable source maps for scripts.
  devtool: 'source-map',
});
