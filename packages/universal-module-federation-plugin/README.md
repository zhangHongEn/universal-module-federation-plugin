# universal-module-federation-plugin

[![npm](https://img.shields.io/npm/v/universal-module-federation-plugin.svg)](https://www.npmjs.com/package/universal-module-federation-plugin)

Keep the original API of module-federation, support the integration of various module specifications

Allows you to control all the processes of each dependency by yourself

## umd examles

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

## umd api

| options                       | desc                                                                      | default                           | examles                                           |
|-------------------------------|---------------------------------------------------------------------------|-----------------------------------|:--------------------------------------------------|
| includeRemotes                | match umd remotes                                                         | []                                | [/umd-app/, "app3"]                               |
| excludeRemotes                | exclude umd remotes                                                       | []                                | ["app2"]                                          |
| dependencies.automatic        | Automatically match dependencies with the same name in remotes and shared | ["shareScopes", "remotes"]        |                                                   |
| dependencies.referenceShares  | umd dependencies use by shares                                            | {}                                | {react: {singleton: true, requiredVersion: "17"}} |
| dependencies.referenceRemotes | umd dependencies use by remotes                                           | {}                                | {react: "app5"}                                   |
| runtimeUmdExposes             |                                                                           | ({$umdValue}) => return $umdValue |                                                   |

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

## custom module specification

If you have modified systemjs, or you have your own module specification, you can use UniversalModuleFederationPlugin to integrate it. The following is the source code of UmdPlugin, and the explanation of each API will be updated after the documentation.

``` js
// webpack.config.js

const PLUGIN_NAME = 'UmdPlugin';
const UniversalModuleFederationPlugin = require("./UniversalModuleFederationPlugin")

class UmdPlugin {

  apply(compiler) {
    new UniversalModuleFederationPlugin({
      runtimeInject: ({$semverhook, $getShare, $getRemote, $containerRemoteKeyMap, $injectVars}) => {
        const {interceptSystemAllDep} = require("umfjs")
        const {System, eventBus} = interceptSystemAllDep()
        
        $semverhook.on("import", (url) => {
          return {
            init(){},
            async get(moduleName = "") {
              const res = await System.import(url)
              return function() {
                return umdExposes({
                  $umdValue: res,
                  $moduleName: moduleName
                })
              }
            }
          }
        })

        eventBus.on("importDep", (dep) => {
          if (referenceRemotes[dep]) {
            return $getRemote(referenceRemotes[dep] || dep)
          }
        })
        eventBus.on("importDep", (dep) => {
          if (referenceShares[dep]) {
            return $getShare(referenceShares[dep].import || dep, referenceShares[dep])
          }
        })
      }
    }).apply(compiler)
  }

}
```