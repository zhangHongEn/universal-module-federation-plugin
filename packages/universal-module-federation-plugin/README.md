# universal-module-federation-plugin

[![npm](https://img.shields.io/npm/v/universal-module-federation-plugin.svg)](https://www.npmjs.com/package/universal-module-federation-plugin)
[中文文档](https://github.com/zhangHongEn/universal-module-federation-plugin/blob/main/packages/universal-module-federation-plugin/README-cn.md)

support [webpack-4](https://github.com/module-federation/webpack-4)、5

Keep the original API of module-federation, support the integration of various module specifications

Allows you to control all the processes of each dependency by yourself

## try online

[mf + umd](https://stackblitz.com/github/wpmjs/examples/tree/main/umf-demo?file=app2%2Fwebpack.config.js)

## Table of contents

* umd federation
    * [UmdPlugin examles](#UmdPlugin-examles)
    * [UmdPlugin API](#UmdPlugin-API)
* UniversalModuleFederation
    * [dynamic remotes](#dynamic-remotes)
    * [UniversalModuleFederationPlugin examles](#UniversalModuleFederationPlugin-examles)
    * [UniversalModuleFederationPlugin API](#UniversalModuleFederationPlugin-API)
    * [Get module-federation configuration at runtime](#Get-module-federation-configuration-at-runtime)

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
            "react-router": "app4reactRouter@https://unpkg.com/react-router@6.4.3/dist/umd/react-router.production.min.js",
            "@remix-run/router": "app5remixRouter@https://unpkg.com/@remix-run/router@1.0.3/dist/router.umd.min.js"
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

| options                       | desc                                                                                      | interface                                      | default                           | examles                                           |
|-------------------------------|-------------------------------------------------------------------------------------------|:-----------------------------------------------|-----------------------------------|:--------------------------------------------------|
| remotes                       | umd remotes                                                                               | { remoteKey: "{global}@{url}" }                | {}                                | string>                                           |
| dependencies.automatic        | Automatically match dependencies with the same name in remotes and shared                 | enum array                                     | ["shareScopes", "remotes"]        |                                                   |
| dependencies.referenceShares  | umd dependencies use by shares                                                            | refer to __*shared*__ config                   | {}                                | {react: {singleton: true, requiredVersion: "17"}} |
| dependencies.referenceRemotes | umd dependencies use by remotes                                                           | Map<string, string>                            | {}                                | {react: "app5"}                                   |
| runtimeUmdExposes             | If the umd package has multiple entries, you can use this function to resolve the entries | function({$moduleValue, $moduleName}): any     | ({$umdValue}) => return $umdValue |                                                   |
| runtimeInject                 | inject code                                                                               | refer to __*UniversalModuleFederationPlugin*__ |                                   |                                                   |

#### runtimeUmdExposes
``` js
// $umdValue: Module object exposed by umd
// $moduleName: "./App" <=== import "umdRemote/App"
runtimeUmdExposes({ $umdValue, $moduleName }) {
    $moduleName = $moduleName.replace(/^\.\/?/, "")
    if ($moduleName) {
      return $umdValue[$moduleName]
    }
    return $umdValue
}
```

## UniversalModuleFederationPlugin examles

If you have your own module specification, you can use UniversalModuleFederationPlugin to integrate it. 
UmdPlugin is implemented using this plugin, you can refer to the [UmdPlugin source code](./src/UmdPlugin.js)

UniversalModuleFederationPlugin Exposes some hooks to customize the loading behavior of remote control

``` js
// webpack.config.js
const {UniversalModuleFederationPlugin} = require("universal-module-federation-plugin")

plugins: [
    new UniversalModuleFederationPlugin({
      remotes: {},
      runtimeInject: {
        injectVars: {},
        initial: () => {},
        import(url, options) {}
      }
    })
]
```


``` js
// webpack.config.js
plugins: [
    new UniversalModuleFederationPlugin({
      remotes: { app2: "app2@http://xxx.js" },
      runtimeInject: {
        // You can access "__umf__.$injectVars.testInjectVar" in any of the following runtime hooks
        injectVars: {
          testInjectVar: 111,
        },
        // any runtime hook can using "__umf__"
        initial: async () => {
          const {$getShare, $getRemote, $containerRemoteKeyMap, $injectVars, $context} = __umf__
          const testInjectVar = $injectVars
          console.log("__umf__", __umf__, testInjectVar)
          // $context is an empty object by default, used to pass values between multiple hooks
          $context.testA = "testA"
          await new Promise(resolve => {
            setTimeout(function () {
              resolve()
            }, 3000)
          })
        },
        // remoteA: "a@http://remoteA.com"
        // name: "a"
        // remoteKey: "remoteA"
        import(url, {name, remoteKey}) {
          console.log("__umf__", __umf__)
          return {
            init(){},
            async get(moduleName = "") {
              return function() {
                return {
                  testModule: 123
                }
              }
            }
          }
        }
      }
    })
]
```

## UniversalModuleFederationPlugin API

| options                                               | desc                                                                                           | default                          | examles                    |
|-------------------------------------------------------|------------------------------------------------------------------------------------------------|----------------------------------|:---------------------------|
| remotes                                               | umf remotes                                                                                    | { remoteKey: "{global}@{url}" }  | {app2: "app@http://xx.js"} |
| runtimeInject.injectVars                              | Inject variables for other runtime hooks, any runtime hook can using "\_\_umf\_\_.$injectVars" | {}                               | {test: 123}                |
| runtimeInject.initial():promise                       | initial runtime hooks                                                                          | []                               |                            |
| runtimeInject.beforeImport(url, options):promise<url> | Triggered before each remote is introduced                                                     | []                               |                            |
| runtimeInject.import(url, options):promise<module>    | Introduce the hook of remote, need to return a container{init, get}                            | []                               |                            |

#### \_\_umf\_\_

Any runtime hooks will inject the "\_\_umf\_\_" variable


| property                                                             | desc                                                                                                                 | examles                                    |
|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| $getRemote("request"):promise<module>                                | Get the remote module, same as import xxx from "xxxx/xxx"                                                            | $getRemote("app2/App")                     |
| $getShare(pkg, {singleton, requiredVersion, ......}):promise<module> | Get modules from shareScopes, same as "shared" configuration                                                         | $getShare("react", {singleton: true})      |
| $containerRemoteKeyMap: object                                       | example remotes: {"@app2/xx": "app3@http://xxx"}  | $containerRemoteKeyMap.app3 --> "@app2/xx" |
| $injectVars: object                                                  | Variables injected by plugins                                                                                        |                                            |
| $context: object                                                     | $context is an empty object by default, used to pass values between multiple hooks                                   | $context.xxx = xxx                         |
| -                                                                    | -                                                                                                                    | -                                          |


## dynamic remotes

Keep the original usage of module-federation, only use the dynamic remote capability

``` js
// webpack.config.js
const {UniversalModuleFederationPlugin} = require("universal-module-federation-plugin")

module.exports = {
    plugins: [
        new ModuleFederationPlugin({
          shared: { react: { singleton: true } },
        }),
        new UniversalModuleFederationPlugin({
          remotes: {
            // 1: {name}@{url}
            // 2: {name}@{dynamic semver remote}
            app2: "app2@http://localhost:3000/remoteEntry.js",
            "mf-app-01": "mfapp01@mf-app-01@1.0.2/dist/remoteEntry.js"
          },
          runtimeInject: {
            resolvePath({name, version, entry, query}) {
              return `https://cdn.jsdelivr.net/npm/${name}@${version}/${entry}?${query}`
            },
            async import(url, {name}) {
              await new Promise(resolve => {
                __webpack_require__.l(url, resolve)
              })
              return window[name]
            }
          }
        }),
    ]
}
```

## Get module-federation configuration at runtime

"runtimeInject" Can be set to function

``` js
// webpack.config.js
const {UniversalModuleFederationPlugin} = require("universal-module-federation-plugin")

module.exports = {
    plugins: [
        new UniversalModuleFederationPlugin({
          runtimeInject: (mfOptions) => ({
            injectVars: {
                mfOptions
            },
            initial() {
                console.log("mfOptions", __umf__.$injectVars.mfOptions)
            }
          })
        }),
    ]
}
```