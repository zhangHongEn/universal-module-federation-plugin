
const PLUGIN_NAME = 'UmdPlugin';
const VirtualModulesPlugin = require("webpack-virtual-modules");
const CustomDelegateModulesPlugin = require("./DelegateModulesPlugin")

let instanceIndex = 0

class UmdPlugin {
  constructor(options = {}) {
    this.options = Object.assign({
      remotes: {},
    }, options)
    this.instanceIndex = ++instanceIndex
  }

  apply(compiler) {
    new VirtualModulesPlugin({
      [`./virtual_umf_systemjsIntercept${this.instanceIndex}.js`]: `
      const _global = require("global")
      const intercept = require("systemjs-intercept")
      const {findShared} = require("module-federation-runtime")
      function SystemClone(...params) {
        _global.System.constructor.apply(this, params)
      }
      inheritPrototype(SystemClone, _global.System.constructor)
      function inheritPrototype(child, parent) {
        // 创建父类原型的副本
        var prototype = Object.create(parent.prototype);
        // 设置子类原型，包括 constructor 属性
        prototype.constructor = child;
        child.prototype = prototype;
      }
      var System = new SystemClone()
      intercept((dep) => {
        if (/https?:\\/\\//.test(dep)) return
        const share = findShared({
          name: dep,
          singleton: true
        })
        if (!share) return
        return Promise.resolve(share.get()).then(res => res())
      }, System)
      module.exports = System
      `
    }).apply(compiler)
    const virtualModules = {}
    const remotes = {
      // key: "internal [file]"
    }
    Object.keys(this.options.remotes).forEach(key => {
      const {nameToGlobal} = require("module-federation-runtime/src/extraExport/mf-name-utils")
      const pathKey = nameToGlobal(key)
      remotes[key] = `internal ./virtual_umf_${pathKey}.js`
      virtualModules[`./virtual_umf_${pathKey}.js`] = `
      const System = require("./virtual_umf_systemjsIntercept${this.instanceIndex}.js")
      module.exports = Promise.resolve({
        init() {},
        get(modulePath) {
          return System.import("${this.options.remotes[key]}").then(async res => {
            modulePath = modulePath || ""
            let moduleData = res
            if (typeof res[modulePath] === "function"){
              moduleData = await res[modulePath]()
            }
            return function() {
              return moduleData
            }
          })
        }
      })
      `
    })
    new VirtualModulesPlugin(virtualModules).apply(compiler)
    new CustomDelegateModulesPlugin({
      ...this.options,
      remotes
    }).apply(compiler)
  }

}

module.exports = UmdPlugin