[![npm](https://img.shields.io/npm/v/single-react-refresh-plugin.svg)](https://www.npmjs.com/package/single-react-refresh-plugin)

Make react-refresh/runtime of multiple webpack projects reach a single instance by setting the global variable \_\_singleReactRefreshRuntime\_\_

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