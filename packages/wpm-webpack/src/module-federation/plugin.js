const PLUGIN_NAME = "WPM_PLUGIN"
const {UniversalModuleFederationPlugin} = require("universal-module-federation-plugin")
const getWebpackVersion = require("universal-module-federation-plugin/src/utils/getWebpackVersion")
const resolveRequest = require("semverhook/src/utils/resolveRequest")
const HackAuthPublicPathPlugin = require("./HackAuthPublicPathPlugin")
const remotesToPreflightPkgs = require("./utils/remotesToPreflightPkgs")
const {nameToGlobal} = require("module-federation-runtime/src/extraExport/mf-name-utils")
const path = require("path")
class WpmPlugin {
  constructor(options = {}) {
    const wpmOptions = new Set([
      "env",
      "map",
      "systemRemotes",
      "mfRemotes",
      "jsonRemotes",
      "umdRemotes",
      "autoUpload"
  ])
    this.options = options = Object.assign({
      "systemRemotes": {},
      "mfRemotes": {},
      "jsonRemotes": {},
      "umdRemotes": {},
      name: function(){
        try {
          return require(path.resolve(process.cwd(),'package.json')).name
        } catch(e) {
          return ""
        }
      }(),
      autoUpload: false,
    }, options)
    if (options.name) {
      options.name = nameToGlobal(options.name)
    }
    this.options.systemRemotes = this.formatWpmRemotes(this.options.systemRemotes)
    this.options.mfRemotes = this.formatWpmRemotes(this.options.mfRemotes)
    this.options.jsonRemotes = this.formatWpmRemotes(this.options.jsonRemotes)
    this.options.umdRemotes = this.formatWpmRemotes(this.options.umdRemotes)
    this.mfOptions = {}
    Object.keys(options).forEach(key => {
      if (!wpmOptions.has(key)) {
        this.mfOptions[key] = options[key]
      }
    })
  }
  
  apply(compiler) {
    if (this.options.autoUpload) {
      new HackAuthPublicPathPlugin().apply(compiler)
    }
    let ModuleFederationPlugin = null
    if (getWebpackVersion(compiler) === 5) {
      ModuleFederationPlugin = require("webpack").container.ModuleFederationPlugin
    } else {
      ModuleFederationPlugin = require("mf-webpack4")
    }
    const mfInstance = new ModuleFederationPlugin({
      ...this.mfOptions,
      filename: "remoteEntry.js",
      library: {
        type: "global",
        name: this.mfOptions.name
      },
    })
    mfInstance.apply(compiler)
    new UniversalModuleFederationPlugin({
      remotes: {
        ...this.options.mfRemotes,
        ...this.options.jsonRemotes,
        ...this.options.systemRemotes,
        ...this.options.umdRemotes,
      },
      runtime: {
        injectVars: {
          init: {
            env: this.options.env,
            map: this.options.map,
            preflightJsonPkgs: remotesToPreflightPkgs(this.options.jsonRemotes),
            preflightMfPkgs: remotesToPreflightPkgs(this.options.mfRemotes),
            preflightSystemPkgs: remotesToPreflightPkgs(this.options.systemRemotes),
            preflightUmdPkgs: remotesToPreflightPkgs(this.options.umdRemotes)
          },
          name: this.options.name
        },
        async initial({__umf__}) {
          require("module-federation-runtime")
          let {
            init: {
              env,
              map,
              ...initParams
            } = {},
            name
          } = __umf__.injectVars
          if (typeof env === "function") {
            env = env()
          }
          if (typeof map === "function") {
            map = map()
          }
          async function _fetchWpm() {
            if (window.__wpm__plugin) {
              // 兼容旧插件加载wpmjs的代码
              await new Promise(resolve => {
                window.__wpm__plugin.wpmjsScriptOnload(resolve)
              })
            }
            const s = document.createElement("script")
            s.src = `https://wpm.hsmob.com/wpmv2/wpmjs/latest/${env || "online"}/index.js?v=${Math.floor(+new Date / 1000 / 60 / 5)}`
            document.head.appendChild(s)
            await new Promise(resolve => {
              s.onload = function () {
                resolve() 
              }
            })
            return window.wpmjs
          }
          if (!(window.__wpmjs__fetchWpm || window.wpmjs)) {
            window.__wpmjs__fetchWpm = await _fetchWpm()
          }
          if (env) {
            window.wpmjs.init({
              env,
              map,
              ...initParams
            })
          } else {
            window.wpmjs.setConfig({
              map,
              ...initParams
            })
          }
        },
        async import({url, name, __umf__}) {
          let {
            init: {
              preflightMfPkgs
            } = {},
          } = __umf__.injectVars
          const {globalToName} = require("module-federation-runtime/src/extraExport/mf-name-utils")
          if (preflightMfPkgs.indexOf(globalToName(name)) > -1) {
            // mf包, 直接请求container
            const container = await window.wpmjs.import(url);
            return {
              init(...params) {
                return container.init(...params)
              },
              async get(...params) {
                const res = await container.$getEntry(...params)
                return () => res
              }
            }
          }
          // 非mf包, get时才请求
          return {
            init() {},
            async get(request) {
              let container = await window.wpmjs.import(url);
              request = request.replace(/^\.\/?/, "")
              const res = await container.$getEntry(request)
              return () => res
            }
          }
        }
      }
    })
    .apply(compiler)
  }

  /**
   * 转换成mf的语法remoteKey: {global}@{url}
   * global部分按照以下标准:
   *  https://github.com/zhangHongEn/universal-module-federation-plugin/blob/main/packages/module-federation-runtime/src/extraExport/mf-name-utils.js
   */
   formatWpmRemotes(wpmRemotes = {}) {
    
    const result = {}
    Object.keys(wpmRemotes).forEach(remoteKey => {
      const name = resolveRequest(wpmRemotes[remoteKey]).name
      result[remoteKey] = `${nameToGlobal(name)}@${wpmRemotes[remoteKey]}`
    })
    return result
  }

}

module.exports = WpmPlugin