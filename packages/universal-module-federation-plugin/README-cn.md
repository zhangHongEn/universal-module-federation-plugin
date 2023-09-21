# universal-module-federation-plugin

[![npm](https://img.shields.io/npm/v/universal-module-federation-plugin.svg)](https://www.npmjs.com/package/universal-module-federation-plugin)

保持模块联合的原始API，支持各种模块规范的集成

允许您自己控制每个依赖项的所有步骤

## 在线尝试

* [mf + umd](https://stackblitz.com/github/wpmjs/examples/tree/main/umf-demo?file=app2%2Fwebpack.config.js)
* [web worker（Using module-federation in worker threads）](https://stackblitz.com/github/wpmjs/examples/tree/main/umf-worker-demo)
    * 这两个插件都可以设置workerFiles来指定worker文件或目录, 以在worker线程使用module-federation
    * ``` js
      // webpack.config.js
      new UmdPlugin({
        workerFiles: [/\.?worker\.js$/]
      })
      new UniversalModuleFederationPlugin({
        workerFiles: [/\.?worker\.js$/]
      })
      ```

## 目录

* umd federation
    * [UmdPlugin示例](#UmdPlugin示例)
    * [UmdPlugin API](#UmdPlugin-API)
* UniversalModuleFederation
    * [UniversalModuleFederationPlugin 示例](#UniversalModuleFederationPlugin-示例)
    * [模块委托](#模块委托)

## UmdPlugin示例

允许模块联合使用umd模

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
          // 匹配的remote以umd模式加载
          remotes: {
            "react-router": "https://unpkg.com/react-router@6.4.3/dist/umd/react-router.production.min.js",
            "@remix-run/router": "https://unpkg.com/@remix-run/router@1.0.3/dist/router.umd.min.js"
          },
        }),
        new UmdPlugin({
          // ...
          // 可多次使用
        })   
    ]
}
```

## UmdPlugin API

| options     | desc                 | default | examles                 |
|-------------|----------------------|---------|:------------------------|
| remotes     | umd remotes          | {}      | {app2: "http://xxx.js"} |
| workerFiles | web worker file path | []      | [/\.?worker\.js$/]      |

## UniversalModuleFederationPlugin 示例

如果你有自己的模块规范，你可以使用 UniversalModuleFederationPlugin 来集成它。 

UniversalModuleFederationPlugin 暴露一些钩子来自定义控制远程的加载行为

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

## 模块委托

[delegate-modules](https://github.com/module-federation/universe/issues/1198)的非官方实现

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
