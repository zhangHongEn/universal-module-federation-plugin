const PLUGIN_NAME = "WPM_PLUGIN"
const {UniversalModuleFederationPlugin} = require("universal-module-federation-plugin")
const path = require("path")
const VirtualModulesPlugin = require("webpack-virtual-modules")
let instanceIndex = 0
class NpmFederationPlugin {
  constructor(options = {}) {
    const {
      name,
      // initial: function(){},
      config,
      debugQuery,
      remotes,
      ...ops
    } = Object.assign({
      name: "",
      // initial: function(){},
      config: {},
      debugQuery: "",
      remotes: {}
    }, options)
    this.options = options
    this.mfOptions = ops
    this.remotes = remotes
    this.config = config
    this.debugQuery = debugQuery
    this.instanceIndex = ++instanceIndex
  }
  
  apply(compiler) {
    const name = this.name || (compiler.options.output || {}).uniqueName || function(){
      try {
        return require(path.resolve(process.cwd(),'package.json')).name
      } catch(e) {
        return ""
      }
    }() || ""
    new VirtualModulesPlugin({
      [`./virtual_npmfederation_wpmjs${this.instanceIndex}`]: `
      const Wpmjs = require("wpmjs")
      const wpmjs = new globalThis.wpmjs.constructor({
        name: ${JSON.stringify(name)}
      })
      wpmjs.setConfig({
        baseUrl: "https://cdn.jsdelivr.net/npm"
      })
      wpmjs.addImportMap(${JSON.stringify(this.remotes)})
      Object.keys(wpmjs.config.importMap).forEach(key => {
        const moduleConfig = wpmjs.config.importMap[key]
        const moduleType = moduleConfig.moduleType
        if (moduleType === "mf") {
          wpmjs.import(key)
        } else if (moduleConfig.preload) {
          wpmjs.import(key)
        }
      })
      module.exports = wpmjs
      `
    }).apply(compiler)
    const remotes = {}
    Object.keys(this.remotes).forEach(remoteKey => {
      remotes[remoteKey] = `promise new Promise(resolve => {
        const wpmjs = require("./virtual_npmfederation_wpmjs${this.instanceIndex}")
        if (wpmjs.config.importMap["${remoteKey}"].moduleType === "mf") {
          return wpmjs.import("${remoteKey}")
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
      ...this.mfOptions,
      remotes,
    }).apply(compiler)
  }

}

module.exports = NpmFederationPlugin