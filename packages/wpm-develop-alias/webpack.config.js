const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const webpackConfig = {
  entry: path.resolve(__dirname, './src/index.js'),
  output: {
    publicPath: "/",
    filename: "index.js",
    chunkFilename: "[name]-[chunkhash].js",
    library: {
      type: "umd",
      name: "wpmDevelopAlias"
    },
  },
  externals: ["react", "react-dom"],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['.json', '.js', '.jsx', '.less', '.css']
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader'
        }]
      },
      {
        test: /\.(le|c)ss$/,
        use: [ 'style-loader', 'css-loader', 'postcss-loader', 'less-loader' ]
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[hash:8].[ext]',
            outputPath: 'static/images'
          }
        }]
      },
      {
        test: /\.(mp3|mp4|webm|ogg|wav|flac|aac)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[hash:8].[ext]',
            outputPath: 'static/media'
          }
        }]
      },
      {
        test: /\.(woff2?|eot|ttf|otf)$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[hash:8].[ext]',
            outputPath: 'static/font'
          }
        }]
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
  ]
}

module.exports = webpackConfig;
