# inject-webpack

[![npm](https://img.shields.io/npm/v/inject-webpack.svg)](https://www.npmjs.com/package/inject-webpack)

webpack inject plugin

### API

``` js
// webpack.config.js
const Inject = require("inject-webpack")

module.exports = {
    entry: {
        a,
        b
    },
    plugins: [
        new Inject(() => {
            return `console.log("inject code1")`
        }, {
            // entry: a、b、webpack-dev-server.....
            // remoteEntry: remoteEntry.js
            // exposesEntry: src/App、src/Button
            // default value is ["entry", "remoteEntry"]
            scopes: ["entry", "remoteEntry", "exposesEntry"]
        }),
    ]
}
```
