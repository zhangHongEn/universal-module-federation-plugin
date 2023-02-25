
const PLUGIN_NAME = 'UmdPlugin';
const formatRuntime = require("./utils/formatRuntime")
const UniversalModuleFederationPlugin = require("./UniversalModuleFederationPlugin")

class UmdPlugin {
  constructor(options = {}) {
    options = Object.assign({
      remotes: {},
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
      runtime: {},
      workerFiles: [],
    }, options)
    options.runtime = formatRuntime(options.runtime)

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
      remotes: this.options.remotes,
      runtime: {
        injectVars: Object.assign({
          referenceShares: this.options.dependencies.referenceShares,
          referenceRemotes: this.options.dependencies.referenceRemotes,
          automatic: this.options.dependencies.automatic,
          runtimeGet: this.options.runtime.get
        }, this.options.runtime.injectVars),
        initial: [
          ({__umf__}) => {
            const {getShare, getRemote, containerRemoteKeyMap, injectVars, context} = __umf__
            const {
              referenceRemotes,
              referenceShares,
              automatic
            } = injectVars
            const {interceptSystemAllDep} = require("umfjs")
            const {System, eventBus} = interceptSystemAllDep()
            context.System = System
            const isInterceptDepFromAllRemotes = automatic.indexOf("remotes") > -1
            const isInterceptDepFromAllShares = automatic.indexOf("shareScopes") > -1
    
            eventBus.on("importDep", (dep) => {
              if (referenceRemotes[dep]) {
                return getRemote(referenceRemotes[dep] || dep)
              }
              if (isInterceptDepFromAllRemotes) {
                const containerName = Object.keys(containerRemoteKeyMap).filter(function (containerName) {
                  const remoteKey = containerRemoteKeyMap[containerName]
                  return remoteKey === dep
                })[0]
                return containerName && getRemote(dep)
              }
            })
            eventBus.on("importDep", (dep) => {
              if (/^https?:/.test(dep)) return
              if (referenceShares[dep]) {
                return getShare(referenceShares[dep].import || dep, referenceShares[dep])
              }
              if (isInterceptDepFromAllShares) {
                return getShare(dep, {singleton: true})
              }
            })
          },
        ].concat(this.options.runtime.initial),
        import: [
          function ({url, __umf__}) {
            const {injectVars} = __umf__
            const {
              runtimeGet,
            } = injectVars
            return {
              init(){},
              async get(request = "") {
                const res = await __umf__.context.System.import(url)
                return function() {
                  return runtimeGet({
                    module: res,
                    request,
                    __umf__
                  })
                }
              }
            }
          }
        ].concat(this.options.runtime.import),
        beforeImport: this.options.runtime.beforeImport,
        resolveRequest: this.options.runtime.resolveRequest,
        resolvePath: this.options.runtime.resolvePath
      },
      workerFiles: this.options.workerFiles
    }).apply(compiler)
  }

}

module.exports = UmdPlugin