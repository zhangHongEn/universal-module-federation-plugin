# universal-module-federation-plugin

[![npm](https://img.shields.io/npm/v/universal-module-federation-plugin.svg)](https://www.npmjs.com/package/universal-module-federation-plugin)
[中文文档](https://github.com/zhangHongEn/universal-module-federation-plugin/blob/main/packages/universal-module-federation-plugin/README-cn.md)

Keep the original API of module-federation, support the integration of various module specifications

Allows you to control all the processes of each dependency by yourself

## try online

* [mf + umd](https://stackblitz.com/github/wpmjs/examples/tree/main/umf-demo?file=app2%2Fwebpack.config.js)
* [web worker（Using module-federation in worker threads）](https://stackblitz.com/github/wpmjs/examples/tree/main/umf-worker-demo)
    * Both plugins can set workerFiles to specify worker files or directories to use module-federation in worker threads
    * ``` js
      // webpack.config.js
      new UmdPlugin({
        workerFiles: [/\.?worker\.js$/]
      })
      new UniversalModuleFederationPlugin({
        workerFiles: [/\.?worker\.js$/]
      })
      ```

## Table of contents

* umd federation
    * [UmdPlugin examles](#UmdPlugin-examles)
    * [UmdPlugin API](#UmdPlugin-API)
* UniversalModuleFederation
    * [UniversalModuleFederationPlugin examles](#UniversalModuleFederationPlugin-examles)
    * [delegate modules](#delegate-modules)

## UmdPlugin examles

Allow module-federation to use umd module, umd dependencies can be obtained from shareScopes or remotes

``` js
// webpack.config.js
const {UmdPlugin} = require("universal-module-federation-plugin")

module.exports = {
    plugins: [
        new ModuleFederationPlugin({
          name: 'app3',
          filename: 'remoteEntry.js',
          remotes: {
            app2: "app2@http://localhost:9002/remoteEntry.js",
          },
          exposes: {
            './App': './src/App',
          },
          shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
        }),
        new UmdPlugin({
          // The matched remotes are loaded in umd mode
          remotes: {
            "react-router": "https://unpkg.com/react-router@6.4.3/dist/umd/react-router.production.min.js",
            "@remix-run/router": "https://unpkg.com/@remix-run/router@1.0.3/dist/router.umd.min.js"
          }
        }),
        new UmdPlugin({
          // ...
          // Can be used multiple times
        })   
    ]
}
```

## UmdPlugin API

| options     | desc                 | interface                       | default | examles            |
|-------------|----------------------|:--------------------------------|---------|:-------------------|
| remotes     | umd remotes          | { remoteKey: "{global}@{url}" } | {}      | string>            |
| workerFiles | web worker file path |                                 | []      | [/\.?worker\.js$/] |

## UniversalModuleFederationPlugin examles

If you have your own module specification, you can use UniversalModuleFederationPlugin to integrate it. 

UniversalModuleFederationPlugin Exposes some hooks to customize the loading behavior of remote control

``` js
// webpack.config.js
const {UniversalModuleFederationPlugin} = require("universal-module-federation-plugin")

plugins: [
    new UniversalModuleFederationPlugin({
      remotes: {
        app1: function (){
          return Promise.resolve({
            init() {},
            async get(modulePath) {
                return function () {
                    return ({"./App1": "./App1", "./App2": "./App2"})[modulePath]
                }
            }
          })
        }
      },
    })
]
```
``` js
// main.js
import App1 from "app1/App1"
import App2 from "app1/App2"
console.log(App1, App2)
```

## delegate modules

Reference from [delegate-modules](https://github.com/module-federation/universe/issues/1198)not the official warehouse

``` js
// webpack.config.js
const {DelegateModulesPlugin} = require("universal-module-federation-plugin")

module.exports = {
    plugins: [
        new ModuleFederationPlugin({
          shared: { react: { singleton: true } },
        }),
        new DelegateModulesPlugin({
            remotes: {
                test1: "internal ./src/remote-delegate.js?remote=test1@http://localhost:9000/remoteEntry.js"
            }
        })
    ]
}
```
``` js
// src/remote-delegate.js
module.exports = new Promise((resolve, reject) => {
  const currentRequest = new URL(__resourceQuery, __webpack_base_uri__).searchParams.get("remote");
  const [global, url] = currentRequest.split('@');
  const __webpack_error__ = new Error()
  __webpack_require__.l(
    url,
    function (event) {
      if (typeof window[global] !== 'undefined') return resolve(window[global]);
      var realSrc = event && event.target && event.target.src;
      __webpack_error__.message = 'Loading script failed.\\n(' + event.message + ': ' + realSrc + ')';
      __webpack_error__.name = 'ScriptExternalLoadError';
      __webpack_error__.stack = event.stack;
      reject(__webpack_error__);
    },
    global,
  );
})
```