
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
    this.mfOptions = null
  }
  apply(compiler) {
    this.mfOptions = this.getMfOptions(compiler.options.plugins)
    this.appName = this.mfOptions.name
    let injectCode = `
    let __umf__ = {
      $semverhook: null,
      $getRemote: null,
      $getShare: null,
      $injectVars: null
    }
    if (!window.__umfplugin__semverhook_${this.appName}_${this.hookIndex}) {
      ;(function () {
        window.__umfplugin__semverhook_${this.appName}_${this.hookIndex} = require("semverhook")()
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
          $semverhook: window.__umfplugin__semverhook_${this.appName}_${this.hookIndex},
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
                      module.exports = Promise.resolve(__umfplugin__semverhook_${this.appName}_${this.hookIndex}.import("${url}"))
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

  getMfOptions(plugins) {
    const federationOptions = plugins.filter(
      (plugin) => {
        return plugin instanceof ModuleFederationPlugin;
      }
    )[0]
    const inheritedPluginOptions = federationOptions._options
    return inheritedPluginOptions
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
}

module.exports = UniversalModuleFederationPlugin;
