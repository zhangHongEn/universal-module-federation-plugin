const HtmlWebpackPlugin = require('html-webpack-plugin');
const {ModuleFederationPlugin} = require('webpack').container
const path = require('path');

module.exports = {
  entry: './src/index',
  devServer: {
    open: false,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    static: path.join(__dirname, 'dist'),
    port: 9002,
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
      name: 'mfapp02',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.js',
      },
      shared: { react: {  }, 'react-dom': {  } },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
