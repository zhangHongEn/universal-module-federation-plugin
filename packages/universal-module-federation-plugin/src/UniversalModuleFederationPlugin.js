
const { RawSource } = require('webpack-sources');
const Inject = require("inject-webpack")
const PLUGIN_NAME = 'UniversalModuleFederationPlugin';
const getWebpackVersion = require("./utils/getWebpackVersion")
const stringifyHasFn = require("stringify-has-fn")
const formatRuntimeInject = require("./utils/formatRuntimeInject")

let hookIndex = 0

class UniversalModuleFederationPlugin {
  constructor(options = {}) {
    options = Object.assign({
      includeRemotes: [],
      excludeRemotes: [],
      runtimeInject: {}
    }, options)
    options.runtimeInject = formatRuntimeInject(options.runtimeInject)
    this.options = options
    this.appName = ""
    this.hookIndex = ++hookIndex
    this.mfOptions = null
    this.containerRemoteKeyMap = null
    this.remoteMap = null
    this.webpackVersion = getWebpackVersion()
  }
  apply(compiler) {
    this.mfOptions = this.getMfInstance(compiler.options.plugins)._options
    this.containerRemoteKeyMap = this.getContainerRemoteKeyMap(this.mfOptions.remotes)
    this.remoteMap = this.getRemoteMap(this.mfOptions.remotes)
    this.appName = this.mfOptions.name
    let injectCode = `
    window.__umfplugin__ = Object.assign({
      semverhook: {
        // [appName_index]
      },
      containerImportMap: {
        // [containerName]: promise<container>
      }
      

    }, window.__umfplugin__ || {})

    getSemverHook()

    function getSemverHook() {
      if (window.__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"]) return
      window.__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"] = require("semverhook")()
      let __umf__ = {
        $semverhook: null,
        $getRemote: null,
        $getShare: null,
        $containerRemoteKeyMap: null,
        $injectVars: null,
        $context: {}
      }

      ;(function () {
        const {findShare} = require("umfjs")

        function $getShare(pkg, config) {
          var share = findShare(pkg, config, typeof __webpack_share_scopes__ !== "undefined" ? __webpack_share_scopes__ : window.usemf.getShareScopes())
          if (share) {
            return share[1].get().then(res => res())
          }
          return null
        }
        async function $getRemote(request = "") {
          const containerName = Object.keys(__umf__.$containerRemoteKeyMap).filter(function(containerName) {
            const remoteKey = __umf__.$containerRemoteKeyMap[containerName]
            return request.indexOf(remoteKey) === 0
          })[0]
          const moduleName = request.replace(__umf__.$containerRemoteKeyMap[containerName], "./")
          if (!window[containerName]) {
            throw new Error("container " + containerName + " not found")
          }
          return (await window[containerName].get(moduleName))()
        }
        Object.assign(__umf__, {
          $semverhook: window.__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"],
          $getRemote,
          $getShare,
          $containerRemoteKeyMap: ${JSON.stringify(this.containerRemoteKeyMap)},
        })
      })();

      const __runtimeInject = ${stringifyHasFn(this.options.runtimeInject)}
      __umf__.$injectVars = __runtimeInject.injectVars
      
      const addHook = function(hookName, listeners) {
        listeners.forEach(cb => {
          __umf__.$semverhook.on(hookName, cb)
        })
      }
      addHook("initial", __runtimeInject.initial)
      addHook("beforeImport", __runtimeInject.beforeImport)
      addHook("import", __runtimeInject.import)
      addHook("resolvePath", __runtimeInject.resolvePath)
      addHook("resolveRequest", __runtimeInject.resolveRequest)
      __umf__.$semverhook.emit("initial")
      return window.__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"]
    }
    `
    new Inject(() => {
      return injectCode
    }).apply(compiler)

    this.prefetchRemotes(compiler)
    if (this.webpackVersion === 5) {
      this.interceptFetchRemotesWebpack5(compiler)
    } else {
      this.interceptFetchRemotesWebpack4(compiler)
    }
  }

  getMfInstance(plugins) {
    const federationInstance = plugins.filter(
      (plugin) => {
        return plugin.constructor.name === "ModuleFederationPlugin"
      }
    )[0]
    return federationInstance
  }

  getContainerRemoteKeyMap(remotes = {}) {
    const map = {}
    Object.keys(remotes).forEach(key => {
      const remoteStr = typeof remotes[key] === "string" ? remotes[key] : remotes[key].external
      if (remoteStr.indexOf("@") === -1) {
        return
      }
      const containerName = remoteStr.split("@")[0]
      map[containerName] = key
    })
    return map
  }

  getRemoteMap(remotes = {}) {
    const map = {}
    Object.keys(remotes).forEach(key => {
      const remoteStr = typeof remotes[key] === "string" ? remotes[key] : remotes[key].external
      if (remoteStr.indexOf("@") === -1) {
        return
      }
      map[key] = remoteStr
    })
    return map
  }

  matchRemotes(name = "") {
    function match(patternOrStr, val) {
      if (typeof patternOrStr === "string") {
        return patternOrStr === val
      }
      return patternOrStr.test(val)
    }
    if (this.options.excludeRemotes.some(pattern => match(pattern, name))) {
      return false
    }
    return this.options.includeRemotes.some(pattern => match(pattern, name))
  }

  /**
   * only umf rmeote
   */
  prefetchRemotes(compiler) {
    if (this.webpackVersion === 4) return
    new Inject(() => {
      return `
      ${Object.keys(this.mfOptions.remotes)
        .filter(remoteName => this.matchRemotes(remoteName))
        .map(remoteName => `require("${remoteName}")`)
        .join(";")
      }
      `
    }, {
      scopes: ["exposesEntry"]
    }).apply(compiler)
  }

  interceptFetchRemotesWebpack4(compiler) {
    const instance = this.getMfInstance(compiler.options.plugins)
    instance.hooks.runtimeFetchContainer.tap(PLUGIN_NAME, (id, url) => {
      if (!this.remoteMap[id]) return
      if (!this.matchRemotes(id)) return
      const name = this.remoteMap[id].split("@")[0]
      return `function () {
        var containerImportMap = window.__umfplugin__.containerImportMap
        containerImportMap["${name}"] = containerImportMap["${name}"] || Promise.resolve(__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"].import("${url}"))
          .then(function(container) {
            window["${name}"] = container
            return container
          })
        return containerImportMap["${name}"]
      }`
    })
  }

  interceptFetchRemotesWebpack5(compiler) {
    compiler.hooks.make.tap(PLUGIN_NAME, compilation => {
      const {ExternalModule} = require("webpack")
      const scriptExternalModules = [];

      compilation.hooks.buildModule.tap(PLUGIN_NAME, module => {
          if (module instanceof ExternalModule && module.externalType === 'script') {
              scriptExternalModules.push(module);
          }
      });

      compilation.hooks.afterCodeGeneration.tap(PLUGIN_NAME, () => {
          scriptExternalModules.map(module => {
            // console.log(1111, module)
              const request = (module.request || "")
              const url = request.split("@").slice(1).join("@")
              const name = request.split("@")[0]
              if (!this.matchRemotes(this.containerRemoteKeyMap[name])) {
                return
              }
              const sourceMap = compilation.codeGenerationResults.get(module).sources;
              const rawSource = sourceMap.get('javascript');
              sourceMap.set(
                  'javascript',
                  new RawSource(
                    `
                    var containerImportMap = window.__umfplugin__.containerImportMap
                    module.exports = containerImportMap["${name}"] = containerImportMap["${name}"] || Promise.resolve(__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"].import("${url}"))
                      .then(function(container) {
                        window["${name}"] = container
                        return container
                      })
                    `
                  )
              );
          });
      });
  });
  }

}

module.exports = UniversalModuleFederationPlugin;
