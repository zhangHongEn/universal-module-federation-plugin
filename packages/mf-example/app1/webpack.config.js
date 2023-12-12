const HtmlWebpackPlugin = require('html-webpack-plugin');
const {ModuleFederationPlugin} = require('webpack').container
const path = require('path');
const NpmFederation = require("npm-federation")
const Inject = require("inject-webpack")
const Port = require("webpack-port-collector")

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
        },
      },
    ],
  },
  plugins: [
    // To learn more about the usage of this plugin, please visit https://webpack.js.org/plugins/module-federation-plugin/
    new NpmFederation({
      initial: `
        console.log("Inject code wpmjsInstance", wpmjs)
        wpmjs.sleep(new Promise(resolve => {
          // fetch("https://xxxxx.json")
          const json = {
            "@remix-run/router": {
              packageVersion: "1.9.0"
            },
            "mf-app-02": {
              packageVersion: "1.0.6"
            }
          }
          setTimeout(() => {
            console.log("Asynchronously obtain data and dynamically set the remotes version", json)
            wpmjs.addImportMap(json)
            resolve()
          }, 100)
        }))`,
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
      // remotes: {
      //   "mfapp01": "mfapp01@https://cdn.jsdelivr.net/npm/mf-app-01/dist/remoteEntry.js"
      // },
      shared: { react: { singleton: false, version: "18.1.0", requiredVersion: "18.1.0" }, 'react-dom': { singleton: false, version: "18.1.0", requiredVersion: "18.1.0" } },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
