
const PLUGIN_NAME = 'UmdPlugin';
const UniversalModuleFederationPlugin = require("./UniversalModuleFederationPlugin")

class UmdPlugin {
  constructor(options = {}) {
    options = Object.assign({
      includeRemotes: [],
      excludeRemotes: [],
      dependencies: {
        // referenceShares: {
        //   react: {
        //     singleton: true
        //   }
        // },
        // referenceRemotes: {
        //   "Button": "app5/Button"
        // },
        // automatic: ["remotes", "shareScopes"]
      },
      runtimeUmdExposes({$umdValue, $moduleName}) {
        return $umdValue
      }
    }, options)
    this.options = options
    if (!options.dependencies.referenceShares) {
      options.dependencies.referenceShares = {}
    }
    if (!options.dependencies.referenceRemotes) {
      options.dependencies.referenceRemotes = {}
    }
    if (!options.dependencies.automatic) {
      options.dependencies.automatic = ["remotes", "shareScopes"]
    }
  }

  apply(compiler) {
    new UniversalModuleFederationPlugin({
      includeRemotes: this.options.includeRemotes,
      excludeRemotes: this.options.excludeRemotes,
      runtimeInject: {
        injectVars: {
          referenceShares: this.options.dependencies.referenceShares,
          referenceRemotes: this.options.dependencies.referenceRemotes,
          umdExposes: this.options.runtimeUmdExposes,
          automatic: this.options.dependencies.automatic,
        },
        initial: () => {
          const {$getShare, $getRemote, $containerRemoteKeyMap, $injectVars, $context} = __umf__
          const {
            referenceRemotes,
            referenceShares,
            automatic
          } = $injectVars
          const {interceptSystemAllDep} = require("umfjs")
          const {System, eventBus} = interceptSystemAllDep()
          $context.System = System
          const isInterceptDepFromAllRemotes = automatic.indexOf("remotes") > -1
          const isInterceptDepFromAllShares = automatic.indexOf("shareScopes") > -1
  
          eventBus.on("importDep", (dep) => {
            if (referenceRemotes[dep]) {
              return $getRemote(referenceRemotes[dep] || dep)
            }
            if (isInterceptDepFromAllRemotes) {
              const containerName = Object.keys($containerRemoteKeyMap).filter(function (containerName) {
                const remoteKey = $containerRemoteKeyMap[containerName]
                return remoteKey === dep
              })[0]
              return containerName && $getRemote(dep)
            }
          })
          eventBus.on("importDep", (dep) => {
            if (/^https?:/.test(dep)) return
            if (referenceShares[dep]) {
              return $getShare(referenceShares[dep].import || dep, referenceShares[dep])
            }
            if (isInterceptDepFromAllShares) {
              return $getShare(dep, {singleton: true})
            }
          })
        },
        import(url) {
          const {$injectVars} = __umf__
          const {
            umdExposes,
          } = $injectVars
          return {
            init(){},
            async get(moduleName = "") {
              const res = await __umf__.$context.System.import(url)
              return function() {
                return umdExposes({
                  $umdValue: res,
                  $moduleName: moduleName
                })
              }
            }
          }
        }
      }
    }).apply(compiler)
  }

}

module.exports = UmdPlugin