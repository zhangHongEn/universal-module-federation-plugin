const path = require("path")
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlPlugin = require("html-webpack-plugin")

module.exports = {
  entry: process.env.NODE_ENV === "production" ? {
    index: "./src/index.js",
  }: {
    test: "./test/test.js",
  },
  externals: [
    process.env.NODE_ENV === "production" && "module-federation-runtime"
  ].filter(b => b),
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
    new CleanWebpackPlugin(),
    ...[process.env.NODE_ENV === "development" && new HtmlPlugin()].filter(item => item),
  ]
};
