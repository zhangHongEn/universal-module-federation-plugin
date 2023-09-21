const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const config = require("./webpack.config");
const HtmlWebpackPlugin = require('html-webpack-plugin');

const webpackConfig = {
  ...config,
  mode: "development",
  target: "web",
  devServer: {
  //   // host: '0.0.0.0',
    port: 8082,
  //   https: true, // 加入这句即可
    headers: {'Access-Control-Allow-Origin': '*' },
  },
  plugins: [
    new HtmlWebpackPlugin(),
    ...config.plugins,
  ]
}

module.exports = webpackConfig;
