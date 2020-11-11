/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-var-requires */
const TerserPlugin = require('terser-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/entry/entry.ts',
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    symlinks: false,
  },
  target: 'node',
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, 'babel.config.json'),
        },
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          // Since we use Styled Components (an implementation of CSS-in-JS) to
          // dynamically add CSS to the page, we use `style-loader` rather than
          // the loader from `mini-css-extract-plugin` so that all the CSS loads
          // at the same time (i.e., when the JavaScript loads).
          {
            loader: 'style-loader',
            options: { injectType: 'singletonStyleTag' },
          },
          {
            loader: 'css-loader',
            options: { importLoaders: 1, sourceMap: false },
          },
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, 'postcss.config.js'),
              },
              sourceMap: true,
            },
          },
          { loader: 'resolve-url-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: /\.svg$/,
        loader: 'file-loader',
        options: {
          name: '[contenthash]-fingerprint.[ext]',
        },
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          output: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
  },
  output: {
    filename: '[contenthash]-fingerprint.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
