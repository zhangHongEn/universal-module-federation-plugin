
const path = require("path")
const Inject = require("inject-webpack")
const PLUGIN_NAME = 'UniversalModuleFederationPlugin';
const getWebpackVersion = require("./utils/getWebpackVersion")
const stringifyHasFn = require("stringify-has-fn")
const formatRuntime = require("./utils/formatRuntime")

let hookIndex = 0

class UniversalModuleFederationPlugin {
  constructor(options = {}) {
    options = Object.assign({
      remotes: {},
      runtime: {},
      shareScope: "default"
    }, options)
    this.options = options
    this.appName = ""
    this.hookIndex = ++hookIndex
    this.containerRemoteKeyMap = null
    this.remoteMap = null
    this.webpackVersion = null
    this.allRemotes = null
  }
  apply(compiler) {
    this.allRemotes = compiler.__umfplugin__allRemotes = Object.assign(compiler.__umfplugin__allRemotes || {}, this.options.remotes)
    this.webpackVersion = getWebpackVersion(compiler)
    this.containerRemoteKeyMap = this.getContainerRemoteKeyMap(compiler.__umfplugin__allRemotes)
    this.remoteMap = this.getRemoteMap(compiler.__umfplugin__allRemotes)
    // TODO: 此处需要优先mfname, 其次uniqueName
    this.appName = require(path.join(process.cwd(), "package.json")).name
    this.options.runtime = this.formatRuntime(this.options.runtime)
    let injectCode = `
    var _global = typeof self === "undefined" ? global : self
    _global.__umfplugin__ = Object.assign({
      semverhook: {
        // [appName_index]
      },
      containerImportMap: {
        // [containerName]: promise<container>
      }
      

    }, _global.__umfplugin__ || {})

    getSemverHook()

    function getSemverHook() {
      if (_global.__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"]) return
      _global.__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"] = require("semverhook")()
      let __umf__ = {
        semverhook: null,
        getRemote: null,
        getShare: null,
        containerRemoteKeyMap: null,
        remotes: null,
        injectVars: null,
        context: {}
      }

      ;(function () {
        const {findShare} = require("umfjs")

        function getShare(pkg, config) {
          var share = findShare(pkg, config, typeof __webpack_share_scopes__ !== "undefined" ? __webpack_share_scopes__ : _global.usemf.getShareScopes())
          if (share) {
            return share[1].get().then(res => res())
          }
          return null
        }
        async function getRemote(request = "") {
          const containerName = Object.keys(__umf__.containerRemoteKeyMap).filter(function(containerName) {
            const remoteKey = __umf__.containerRemoteKeyMap[containerName]
            const remoteKeyIndex = request.indexOf(remoteKey)
            const moduleName = request.replace(remoteKey, "")
            return remoteKeyIndex === 0 && (moduleName === "" || moduleName[0] === "/")
          })[0]
          const moduleName = request.replace(__umf__.containerRemoteKeyMap[containerName], ".")

          // interceptFetchRemotesCode处的代码
          var _global = typeof self === "undefined" ? global : self
          var containerImportMap = _global.__umfplugin__.containerImportMap
          if (!containerImportMap[containerName] && _global[containerName]) {
            containerImportMap[containerName] = Promise.resolve(_global[containerName])
          }
          containerImportMap[containerName] = containerImportMap[containerName] || Promise.resolve(__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"]
            .import(__umf__.remoteMap[__umf__.containerRemoteKeyMap[containerName]].split("@").slice(1).join("@"), {name: containerName, remoteKey: remoteKey = __umf__.containerRemoteKeyMap[containerName]}))
            .then(function(container) {
              _global[containerName] = _global[containerName] || container
              return container
            })
          await containerImportMap[containerName]
          if (!_global[containerName]) {
            throw new Error("container " + containerName + " not found")
          }
          return (await _global[containerName].get(moduleName))()
        }
        Object.assign(__umf__, {
          semverhook: _global.__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"],
          getRemote,
          getShare,
          containerRemoteKeyMap: ${JSON.stringify(this.containerRemoteKeyMap)},
          remoteMap: ${JSON.stringify(this.allRemotes)},
        })
      })();

      ${(() => {
        const runtime = this.options.runtime
        if (typeof runtime === "string") {
          return `const __runtime = require("universal-module-federation-plugin/src/utils/formatRuntime.js")(require("${runtime}"))`
        }
        return `const __runtime = ${stringifyHasFn(this.options.runtime)}`
      })()}
      __umf__.injectVars = __runtime.injectVars
      
      const addHook = function(hookName, listeners, convertParams = (...params) => params) {
        listeners.forEach(cb => {
          __umf__.semverhook.on(hookName, function (...params) {
            return cb(...convertParams(...params))
          })
        })
      }
      var initialPromises = []
      addHook("initial", [function () {
        __runtime.initial.forEach(initial => {
          initialPromises.push(Promise.resolve(initial({__umf__})))
        })
      }])
      addHook("beforeImport", [async function (url) {
        await Promise.all(initialPromises)
        return url
      }])
      addHook("beforeImport", __runtime.beforeImport, (url, options) => {
        return [{
          url,
          name: options.name,
          remoteKey: options.remoteKey,
          __umf__
        }]
      })
      addHook("import", __runtime.import, (url, options) => {
        return [{
          url,
          name: options.name,
          remoteKey: options.remoteKey,
          __umf__
        }]
      })
      addHook("resolvePath", __runtime.resolvePath, (request) => {
        return [{
          ...request,
          __umf__
        }]
      })
      addHook("resolveRequest", __runtime.resolveRequest, (request) => {
        return [{
          ...request,
          __umf__
        }]
      })
      __umf__.semverhook.emit("initial")
      return _global.__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"]
    }
    `
    new Inject(() => {
      return injectCode
    }).apply(compiler)

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
    if (!federationInstance) throw new Error("rely ModuleFederationPlugin")
    return federationInstance
  }

  // TODO: merge remotes
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

  interceptFetchRemotesWebpack4(compiler) {
    const instance = this.getMfInstance(compiler.options.plugins)
    instance.hooks.runtimeFetchContainer.tap(PLUGIN_NAME, (id, url) => {
      if (!this.remoteMap[id]) return
      if (!this.matchRemotes(id)) return
      const name = this.remoteMap[id].split("@")[0]
      return `function () {
        ${this.interceptFetchRemotesCode({name, url, remoteKey: id})}
      }`
    })
  }

  interceptFetchRemotesWebpack5(compiler) {
    const {ContainerReferencePlugin} = require("webpack").container
    const options = this.options
    const remoteModuleMap = {}
    Object.keys(options.remotes).forEach(remoteKey => {
      const request = options.remotes[remoteKey]
      const url = request.split("@").slice(1).join("@")
      const name = request.split("@")[0]
      remoteModuleMap[remoteKey] = `
      function(){
        ${this.interceptFetchRemotesCode({name, url, remoteKey})}
      }()
      `
    })
    new ContainerReferencePlugin({
      // 此处固定var, interceptFetchRemotesCode函数会重写var类型
      remoteType: "var",
      shareScope: this.options.shareScope,
      remotes: remoteModuleMap
    }).apply(compiler)
  }

  interceptFetchRemotesCode({name, url, remoteKey}) {
    return `
    var _global = typeof self === "undefined" ? global : self
    var containerImportMap = _global.__umfplugin__.containerImportMap
    if (!containerImportMap["${name}"] && _global["${name}"]) {
      containerImportMap["${name}"] = Promise.resolve(_global["${name}"])
    }
    return containerImportMap["${name}"] = containerImportMap["${name}"] || Promise.resolve(__umfplugin__.semverhook["${this.appName}_${this.hookIndex}"]
      .import("${url}", {name: ${JSON.stringify(name)}, remoteKey: ${JSON.stringify(remoteKey)}}))
      .then(function(container) {
        _global["${name}"] = _global["${name}"] || container
        return container
      })
    `
  }

  formatRuntime(runtime = {}) {
    if (typeof runtime === "function") {
      runtime = runtime(this)
    }
    runtime = formatRuntime(runtime)
    return runtime
  }

}

module.exports = UniversalModuleFederationPlugin;
