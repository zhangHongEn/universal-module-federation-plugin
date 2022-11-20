# universal-module-federation-plugin

[![npm](https://img.shields.io/npm/v/universal-module-federation-plugin.svg)](https://www.npmjs.com/package/universal-module-federation-plugin)

Keep the original API of module-federation, support the integration of various module specifications

Allows you to control all the processes of each dependency by yourself

## try online

[mf + umd](https://stackblitz.com/github/wpmjs/examples/tree/main/umf-demo?file=app2%2Fwebpack.config.js)

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
            "react-router": "app4reactRouter@https://unpkg.com/react-router@6.4.3/dist/umd/react-router.production.min.js",
            "@remix-run/router": "app5remixRouter@https://unpkg.com/@remix-run/router@1.0.3/dist/router.umd.min.js"
          },
          exposes: {
            './App': './src/App',
          },
          shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
        }),
        new UmdPlugin({
          // The matched remotes are loaded in umd mode
          includeRemotes: [/react-router/, "@remix-run/router"],
          dependencies: {
            automatic: ["shareScopes", "remotes"],
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

| options                       | desc                                                                                      | default                           | examles                                           |
|-------------------------------|-------------------------------------------------------------------------------------------|-----------------------------------|:--------------------------------------------------|
| includeRemotes                | match umd remotes                                                                         | []                                | [/umd-app/, "app3"]                               |
| excludeRemotes                | exclude umd remotes                                                                       | []                                | ["app2"]                                          |
| dependencies.automatic        | Automatically match dependencies with the same name in remotes and shared                 | ["shareScopes", "remotes"]        |                                                   |
| dependencies.referenceShares  | umd dependencies use by shares                                                            | {}                                | {react: {singleton: true, requiredVersion: "17"}} |
| dependencies.referenceRemotes | umd dependencies use by remotes                                                           | {}                                | {react: "app5"}                                   |
| runtimeUmdExposes             | If the umd package has multiple entries, you can use this function to resolve the entries | ({$umdValue}) => return $umdValue |                                                   |

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
      includeRemotes: [/.*/],
      excludeRemotes: [],
      runtimeInject: {
        injectVars: {},
        initial: () => {},
        beforeImport(url) {},
        import(url) {}
      }
    })
]
```


``` js
// webpack.config.js
plugins: [
    new UniversalModuleFederationPlugin({
      includeRemotes: [/.*/],
      excludeRemotes: [],
      runtimeInject: {
        // You can access "__umf__.$injectVars.testInjectVar" in any of the following runtime hooks
        injectVars: {
          testInjectVar: 111,
        },
        // any runtime hook can using "__umf__"
        initial: () => {
          const {$getShare, $getRemote, $containerRemoteKeyMap, $injectVars, $context} = __umf__
          const testInjectVar = $injectVars
          console.log("__umf__", __umf__, testInjectVar)
          // $context is an empty object by default, used to pass values between multiple hooks
          $context.testA = "testA"
        },
        beforeImport(url) {
          console.log(__umf__.$context)
          return new Promise(resolve => {
            setTimeout(function () {
              resolve(url)
            }, 3000)
          })
        },
        import(url) {
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

| options                                      | desc                                                                                       | default      | examles             |
|----------------------------------------------|--------------------------------------------------------------------------------------------|--------------|:--------------------|
| includeRemotes                               | match umd remotes                                                                          | []           | [/umd-app/, "app3"] |
| excludeRemotes                               | exclude umd remotes                                                                        | []           | ["app2"]            |
| runtimeInject.injectVars                     | Inject variables for other runtime hooks, any runtime hook can using "\_\_umf\_\_.$injectVars" | {}           | {test: 123}         |
| runtimeInject.initial()                      | initial runtime hooks                                                                      | function(){} |                     |
| runtimeInject.beforeImport(url):promise<url> | Triggered before each remote is introduced                                                 | function(){} |                     |
| runtimeInject.import(url):promise<module>    | Introduce the hook of remote, need to return a container{init, get}                        | function(){} |                     

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

