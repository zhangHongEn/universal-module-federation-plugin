[![npm](https://img.shields.io/npm/v/single-react-refresh-plugin.svg)](https://www.npmjs.com/package/single-react-refresh-plugin)

This package is used with @pmmmwh/react-refresh-webpack-plugin and module-federation for hot update

see [https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/394](https://github.com/pmmmwh/react-refresh-webpack-plugin/issues/394)

[try online](https://stackblitz.com/github/wpmjs/examples/tree/main/module-federation-react-hmr)

``` js
// webpack.config.js
const SingleReactRefreshPlugin = require("single-react-refresh-plugin")

module.exports = {
  plugins: [
    new SingleReactRefreshPlugin()
  ]
}
```