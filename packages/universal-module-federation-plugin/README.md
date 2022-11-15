# universal-module-federation-plugin

Keep the original API of module-federation, support the integration of various module specifications

Allows you to control all the processes of each dependency by yourself

Can do almost anything you want

## umd

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
            app4reactRouter: "app4reactRouter@https://unpkg.com/react-router@6.4.3/dist/umd/react-router.production.min.js",
            app5remixRouter: "app5remixRouter@https://unpkg.com/@remix-run/router@1.0.3/dist/router.umd.min.js"
          },
          exposes: {
            './App': './src/App',
          },
          shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
        }),
        new UmdPlugin({
          // The matched remotes are loaded in umd mode
          includeRemotes: ["app4reactRouter", /app5remixRouter/],
          // $umdValue: Module object exposed by umd
          // $moduleName: "./App" <=== import "umdRemote/App"
          runtimeUmdExposes({ $umdValue, $moduleName }) {
            $moduleName = $moduleName.replace(/^\.\/?/, "")
            if ($moduleName) {
              return $umdValue[$moduleName]
            }
            return $umdValue
          },
          dependencies: {
            // Automatically match dependencies with the same name in remotes and shared
            automatic: ["shareScopes", "remotes"],
            referenceShares: {
              // "react" This dependency is fetched from shareScopes
              react: {
                singleton: true
              },
            },
            referenceRemotes: {
              // "@remix-run/router" This dependency is obtained from remotes
              "@remix-run/router": "app5remixRouter"
            }
          }
        }),
        new UmdPlugin({
          // ...
          // Can be used multiple times
        })   
    ]
}
```

## custom module specification

If you have modified systemjs, or you have your own module specification, you can use UniversalModuleFederationPlugin to integrate it. The following is the source code of UmdPlugin, and the explanation of each API will be updated after the documentation.

```
// webpack.config.js
const {UniversalModuleFederationPlugin} = require("universal-
module.exports = {
    plugins: [
        new UniversalModuleFederationPlugin({
          includeRemotes: this.options.includeRemotes,
          excludeRemotes: this.options.excludeRemotes,
          runtimeInjectVars: {
            referenceShares: this.options.dependencies.referenceShares,
            referenceRemotes: this.options.dependencies.referenceRemotes,
            umdExposes: this.options.runtimeUmdExposes
          },
          runtimeInject: ({$semverhook, $getShare, $getRemote, $injectVars}) => {
            const {
              referenceRemotes,
              referenceShares,
              umdExposes
            } = $injectVars
            const {interceptSystemDep} = require("umfjs")
            const interceptDeps = Object.keys(referenceShares)
              .concat(Object.keys(referenceRemotes))
    
            $semverhook.on("resolve", (url) => {})
            $semverhook.on("import", (url) => {
              return {
                init(){},
                async get(moduleName = "") {
                  const res = await window.System.import(url)
                  return function() {
                    return umdExposes({
                      $umdValue: res,
                      $moduleName: moduleName
                    })
                  }
                }
              }
            })
    
            interceptSystemDep(interceptDeps, async (dep) => {
              let depValue = null
              if (referenceShares[dep]) {
                depValue = await $getShare(referenceShares[dep].import || dep, referenceShares[dep])
              } else if (referenceRemotes[dep]) {
                depValue = await $getRemote(referenceRemotes[dep])
              }
              return depValue
            })
          }
        }).apply(compiler)
    ]
}
```