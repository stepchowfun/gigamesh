const nodeExternals = require('webpack-node-externals');
const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
  entry: './src/main/main.tsx',
  resolve: {
    extensions: ['.ts', '.tsx'],
  },
  externals: [nodeExternals()],
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
        test: /\.svg$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [new CleanWebpackPlugin()],
  output: {
    filename: 'frontend-lib.js',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
    assetModuleFilename: '[contenthash]-fingerprint[ext]',
    publicPath: '/',
  },
  devtool: 'source-map',
};
