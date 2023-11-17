const PLUGIN_NAME = "WPM_PLUGIN"
const {UniversalModuleFederationPlugin} = require("universal-module-federation-plugin")
const path = require("path")
const VirtualModulesPlugin = require("webpack-virtual-modules")
const Port = require("webpack-port-collector")
const {ModuleFederationPlugin} = require("webpack").container
let instanceIndex = 0
class NpmFederationPlugin {
  constructor(options = {}) {
    const {
      initial,
      config,
      debugQuery,
      remotes,
      workerFiles,
      ...ops
    } = Object.assign({
      initial: "",
      config: {},
      debugQuery: "",
      remotes: {},
      workerFiles: undefined
    }, options)
    this.options = options
    this.mfOptions = ops
    this.initial = initial
    this.remotes = remotes
    this.config = config
    this.debugQuery = debugQuery
    this.workerFiles = workerFiles
    this.instanceIndex = ++instanceIndex
  }
  
  apply(compiler) {
    const mfOptions = this.mfOptions
    if (mfOptions.filename && mfOptions.name) {
      new Port({
        packageName: mfOptions.name,
        filename: mfOptions.filename
      }).apply(compiler)
      new ModuleFederationPlugin({
        ...mfOptions,
        remotes: {},
      }).apply(compiler)
    } else if (mfOptions.shared || mfOptions.exposes) {
      new ModuleFederationPlugin({
        ...this.mfOptions,
        remotes: {},
      }).apply(compiler)
    }
    const name = this.mfOptions.name || (compiler.options.output || {}).uniqueName || function(){
      try {
        return require(path.resolve(process.cwd(),'package.json')).name
      } catch(e) {
        return ""
      }
    }() || ""
    new VirtualModulesPlugin({
      [`./virtual_npmfederation_wpmjs${this.instanceIndex}`]: `
      const Wpmjs = require("wpmjs")
      let wpmjs = new globalThis.wpmjs.constructor({
        name: ${JSON.stringify(name)}
      })
      ${this.initial}
      wpmjs.setConfig(${JSON.stringify(this.config || {})})
      wpmjs.addImportMap(${JSON.stringify(this.remotes)})
      const __mfList = []
      const __preloadSystemList = []
      Object.keys(wpmjs.config.importMap).forEach(key => {
        const moduleConfig = wpmjs.config.importMap[key]
        const moduleType = moduleConfig.moduleType
        if (moduleType === "mf") {
          __mfList.push(key)
        } else if (moduleConfig.preload) {
          __preloadSystemList.push(key)
        }
      })
      // First load the mf module and initialize shareScopes
      __mfList.forEach(key => wpmjs.import(key))
      // The dependencies of the system module will be obtained after shareScopes is loaded.
      __preloadSystemList.forEach(key => wpmjs.import(key))
      module.exports = wpmjs
      `
    }).apply(compiler)
    const remotes = {}
    Object.keys(this.remotes).forEach(remoteKey => {
      // This promise new Promise syntax is not native and will be compiled by Webpack. Please feel free to use it.
      remotes[remoteKey] = `promise new Promise(resolve => {
        const wpmjs = require("./virtual_npmfederation_wpmjs${this.instanceIndex}")
        if (wpmjs.config.importMap["${remoteKey}"].moduleType === "mf") {
          resolve(wpmjs.import("${remoteKey}"))
          return
        }
        
        resolve({
          init() {
            return 1
          },
          async get(modulePath) {
            modulePath = modulePath.replace(/^\\.\\/?/, "")
            modulePath = modulePath ? "/" + modulePath : ""
            const res = await wpmjs.import("${remoteKey}" + modulePath)
            return () => res
          }
        })
      })`
    })
    
    new UniversalModuleFederationPlugin({
      remotes,
      workerFiles: this.workerFiles
    }).apply(compiler)
  }

}

module.exports = NpmFederationPlugin