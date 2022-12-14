const path = require("path")
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const HtmlPlugin = require("html-webpack-plugin")

module.exports = {
  entry: "./src/index.js",
  resolve: {
    extensions: ['.js', '.vue', '.ts', '.json'],
  },
  externals: ["semverhook"],
  devServer: {
    open: true
  },
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "./index.js",
    chunkFilename: "[name]-[chunkhash].js",
    library: {
      name: "umfjs",
      type: "umd"
    }
  },
  module: {
    rules: [
      { parser: { system: false } },
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
    ...[process.env.NODE_ENV === "development" && new HtmlPlugin()].filter(item => item)
  ]
};
