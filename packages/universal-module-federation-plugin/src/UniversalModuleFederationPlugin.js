
const { RawSource } = require('webpack-sources');
const Inject = require("inject-webpack")
const PLUGIN_NAME = 'UniversalModuleFederationPlugin';
const {ExternalModule} = require("webpack")
const {ModuleFederationPlugin} = require("webpack").container
const stringifyHasFn = require("./utils/stringifyHasFn")
let hookIndex = 0

class UniversalModuleFederationPlugin {
  constructor(options = {}) {
    options = Object.assign({
      includeRemotes: [],
      excludeRemotes: [],
      runtimeInject: function ({$semverhook, $getShare, $getRemote, $injectVars}) {},
      runtimeInjectVars: {}
    }, options)
    this.options = options
    this.appName = ""
    this.hookIndex = ++hookIndex
  }
  apply(compiler) {
    this.appName = this.getAppName(compiler.options.plugins)
    let injectCode = `
    ${this.hackWebpack4()}
    let __umf__ = {
      $semverhook: null,
      $getRemote: null,
      $getShare: null,
      $injectVars: null
    }
    if (!window.semverhook_${this.appName}_${this.hookIndex}) {
      ;(function () {
        window.semverhook_${this.appName}_${this.hookIndex} = require("semverhook")()
        const {findShare} = require("umfjs")

        async function $getShare(pkg, config) {
          return (await findShare(pkg, config, __webpack_share_scopes__)[1].get())()
        }
        async function $getRemote(request = "") {
          const requestArray = request.split("/")
          const containerName = requestArray[0]
          const moduleName = "./" + requestArray.slice(1).join("/")
          if (!window[containerName]) {
            throw new Error("container " + containerName + " not found")
          }
          return (await window[containerName].get(moduleName))()
        }
        __umf__ = {
          $semverhook: window.semverhook_${this.appName}_${this.hookIndex},
          $getRemote,
          $getShare,
          $injectVars: ${stringifyHasFn(this.options.runtimeInjectVars)}
        }
      })();
      const injectFn = ${stringifyHasFn({ fn: this.options.runtimeInject })}.fn
      injectFn(__umf__)
    }
    `
    new Inject(() => {
      return injectCode
    }).apply(compiler)

    compiler.hooks.make.tap(PLUGIN_NAME, compilation => {
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

                if (!this.matchRemotes(name)) {
                  return
                }
                const sourceMap = compilation.codeGenerationResults.get(module).sources;
                const rawSource = sourceMap.get('javascript');
                sourceMap.set(
                    'javascript',
                    new RawSource(
                      `
                      module.exports = Promise.resolve(semverhook_${this.appName}_${this.hookIndex}.import("${url}"))
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

  getAppName(plugins) {
    const federationOptions = plugins.filter(
      (plugin) => {
        return plugin instanceof ModuleFederationPlugin;
      }
    )[0]
    const inheritedPluginOptions = federationOptions._options
    return inheritedPluginOptions.name
  }

  /**
   * 此处逻辑只是修复systemjs与webpack-4插件wpmjs的冲突
   */
  hackWebpack4() {
    return `

    if (window.wpmjs && window.wpmjs.resolvePath && window.wpmjs.resolvePath.__wpm__defaultProp) {
      window.System.__wpmjs__.resolvePath = window.wpmjs.resolvePath = function ({name, version, entry, query}) {
        return ""
      }
      window.wpmjs.resolvePath.__wpm__defaultProp = true
    }
    `
  }

  matchRemotes(name = "") {
    if (this.options.excludeRemotes.some(pattern => pattern.test(name))) {
      return false
    }
    return this.options.includeRemotes.some(pattern => pattern.test(name))
  }
}

module.exports = UniversalModuleFederationPlugin;
