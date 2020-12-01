const TerserPlugin = require('terser-webpack-plugin');
const WebpackManifestPlugin = require('webpack-manifest-plugin');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/main.tsx',
  resolve: {
    extensions: ['.js', '.ts', '.tsx'],
    symlinks: false,
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        include: path.resolve(__dirname, 'src'),
        loader: 'babel-loader',
        options: {
          configFile: path.resolve(__dirname, 'babel.config.json'),
        },
      },
      {
        test: /\.js$/,
        include: path.resolve(__dirname, 'src'),
        enforce: 'pre',
        loader: 'source-map-loader',
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new WebpackManifestPlugin({ publicPath: '' }),
  ],
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
