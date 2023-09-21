const path = require("path")
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlPlugin = require("html-webpack-plugin")
const {DefinePlugin} = require("webpack")
const Wpm = require("wpm-plugin")

module.exports = {
  entry: {
    index: "./src/index.js",
    test: "./src/test/test.js"
  },
  resolve: {
    extensions: ['.js', '.vue', '.ts', '.json'],
  },
  output: {
    publicPath: "/",
    path: path.resolve(__dirname, "./dist"),
    filename: "./[name].js",
    chunkFilename: "[name]-[chunkhash].js",
    library: {
      name: "WPMJS",
      type: "umd"
    }
  },
  devServer: {
    open: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  module: {
    rules: [
      // { parser: { system: false } },
      {
        test: /\.m?jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              configFile: path.resolve(process.cwd(), "babel.config.js"),
              babelrc: false
            }
          }
        ]
      },
    ]
  },
  plugins: [
    ...[process.env.NODE_ENV === "development" && new HtmlPlugin()].filter(item => item),
  ]
};
