const HtmlWebpackPlugin = require('html-webpack-plugin');
const {ModuleFederationPlugin} = require('webpack').container
const path = require('path');
const {UmdPlugin} = require("universal-module-federation-plugin")
const Inject = require("inject-webpack")

module.exports = {
  entry: './src/index',
  devServer: {
    open: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    static: path.join(__dirname, 'dist'),
    port: 9001,
  },
  output: {
    clean: true,
    publicPath: 'auto',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react'],
        },
      },
    ],
  },
  plugins: [
    // To learn more about the usage of this plugin, please visit https://webpack.js.org/plugins/module-federation-plugin/
    new ModuleFederationPlugin({
      name: 'mfapp01',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.js',
      },
      shared: { react: { singleton: false, version: "18.1.0", requiredVersion: "18.1.0" }, 'react-dom': { singleton: false, version: "18.1.0", requiredVersion: "18.1.0" } },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
