const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const NpmFederation = require("npm-federation")
const ReactRefresh = require("@pmmmwh/react-refresh-webpack-plugin")
const SingleReact = require("single-react-refresh-plugin")

module.exports = {
  entry: './src/index',
  devServer: {
    open: false,
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
          plugins: [require("react-refresh/babel")]
        },
      },
    ],
  },
  plugins: [
    // To learn more about the usage of this plugin, please visit https://webpack.js.org/plugins/module-federation-plugin/
    new NpmFederation({
      initial: `
        console.log("Inject code wpmjsInstance", wpmjs)
        `,
      baseUrl: "https://cdn.jsdelivr.net/npm",
      remotes: {
        "@remix-run/router": "@remix-run/router/dist/router.umd.min.js",
        "mf-app-02": {
          package: "mf-app-02/dist/remoteEntry.js",
          global: "mfapp02"
        },
      },
      name: 'mfapp01',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.js',
      },
      shared: { react: { singleton: false }, 'react-dom': { singleton: false} },
    }),
    new ReactRefresh(),
    new SingleReact(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
