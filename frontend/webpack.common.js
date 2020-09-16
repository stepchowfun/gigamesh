const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/index/index.tsx',
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
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
          { loader: 'postcss-loader', options: { sourceMap: true } },
          { loader: 'resolve-url-loader', options: { sourceMap: true } },
          { loader: 'sass-loader', options: { sourceMap: true } },
        ],
      },
      {
        test: /\.svg$/,
        use: ['file-loader'],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: 'src/index/index.html',
    }),
    new CopyPlugin({
      patterns: [{ from: 'static', to: '.' }],
    }),
  ],
  optimization: {
    minimizer: [new TerserJSPlugin({})],
  },
  output: {
    filename: '[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './dist',
  },
};
