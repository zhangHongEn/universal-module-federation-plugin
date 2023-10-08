const HtmlWebpackPlugin = require('html-webpack-plugin');
const {ModuleFederationPlugin} = require('webpack').container
const path = require('path');
const NpmFederation = require("npm-federation")
const Inject = require("inject-webpack")
const Port = require("webpack-port-collector")

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
    path: __dirname + "/dist",
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
    new Port(),
    new NpmFederation({
      config: {
        baseUrl: "https://cdn.jsdelivr.net/npm"
      },
      remotes: {
        "@remix-run/router": "@remix-run/router@1.0.3/dist/router.umd.min.js",
      }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
