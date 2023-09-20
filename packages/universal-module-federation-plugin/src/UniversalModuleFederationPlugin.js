
const stringifyHasFn = require("stringify-has-fn")
const VirtualModulesPlugin = require("webpack-virtual-modules");
const CustomDelegateModulesPlugin = require("./DelegateModulesPlugin")

class UniversalModuleFederationPlugin {
  constructor(options = {}) {
    this.options = options
    this.internalMap = this.getInternalMap()
  }
  apply(compiler) {
    const virtualModules = {}
    Object.keys(this.internalMap).forEach(key => {
      const {nameToGlobal} = require("module-federation-runtime/src/extraExport/mf-name-utils")
      const pathKey = nameToGlobal(key)
      this.options.remotes[key] = `internal ./virtual_umf_${pathKey}.js`
      virtualModules[`./virtual_umf_${pathKey}.js`] = `
      module.exports = Promise.resolve((${stringifyHasFn({fn: this.internalMap[key]})}).fn())
      `
    })
    new VirtualModulesPlugin(virtualModules).apply(compiler)
    new CustomDelegateModulesPlugin(this.options).apply(compiler)
  }
  getInternalMap() {
    const internalMap = {}
    Object.keys(this.options.remotes).forEach(key => {
      const fn = this.options.remotes[key]
      if (typeof fn === "function") {
        internalMap[key] = fn
      }
    })
    return internalMap
  }
}

module.exports = UniversalModuleFederationPlugin;
