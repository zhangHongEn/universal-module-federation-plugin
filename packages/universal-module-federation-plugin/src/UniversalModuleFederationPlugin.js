
const stringifyHasFn = require("stringify-has-fn")
const VirtualModulesPlugin = require("webpack-virtual-modules");
const CustomDelegateModulesPlugin = require("./DelegateModulesPlugin")

class UniversalModuleFederationPlugin {
  constructor(options = {}) {
    this.options = options
  }
  apply(compiler) {
    const virtualModules = {}
    const remotes = this.options.remotes
    Object.keys(remotes).forEach(key => {
      const {nameToGlobal} = require("module-federation-runtime/src/extraExport/mf-name-utils")
      const pathKey = nameToGlobal(key)
      const remote = remotes[key]
      if (typeof remote === "function") {
        virtualModules[`./virtual_umf_${pathKey}.js`] = `
        module.exports = Promise.resolve((${stringifyHasFn({fn: this.internalMap[key]})}).fn())
        `
      } else if (typeof remote === "string" && remote.startsWith("promise ")) {
        virtualModules[`./virtual_umf_${pathKey}.js`] = `
        module.exports = ${remote.replace("promise ", "")}
        `
      }
      remotes[key] = `internal ./virtual_umf_${pathKey}.js`
    })
    new VirtualModulesPlugin(virtualModules).apply(compiler)
    new CustomDelegateModulesPlugin(this.options).apply(compiler)
  }
}

module.exports = UniversalModuleFederationPlugin;
