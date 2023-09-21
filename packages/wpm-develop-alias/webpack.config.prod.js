const config = require("./webpack.config");

const webpackConfig = {
  ...config,
  plugins: [
    ...config.plugins,
  ]
}

module.exports = webpackConfig;
