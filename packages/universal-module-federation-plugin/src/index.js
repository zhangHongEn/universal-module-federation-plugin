
const PLUGIN_NAME = 'UmdPlugin';
const UniversalModuleFederationPlugin = require("./UniversalModuleFederationPlugin")

class UmdPlugin {
  constructor(options = {}) {
    options = Object.assign({
      includeRemotes: [],
      excludeRemotes: [],
      dependencies: {
        // referenceShares: {
        //   react: {
        //     singleton: true
        //   }
        // },
        // referenceRemotes: {
        //   "Button": "app5/Button"
        // }
      },
      runtimeUmdExposes({$umdValue, $moduleName}) {
        return $umdValue
      }
    }, options)
    this.options = options
    if (!options.dependencies.referenceShares) {
      options.dependencies.referenceShares = {}
    }
    if (!options.dependencies.referenceRemotes) {
      options.dependencies.referenceRemotes = {}
    }
  }

  apply(compiler) {
    new UniversalModuleFederationPlugin({
      includeRemotes: this.options.includeRemotes,
      excludeRemotes: this.options.excludeRemotes,
      runtimeInjectVars: {
        referenceShares: this.options.dependencies.referenceShares,
        referenceRemotes: this.options.dependencies.referenceRemotes,
        umdExposes: this.options.runtimeUmdExposes
      },
      runtimeInject: ({$semverhook, $getShare, $getRemote, $injectVars}) => {
        const {
          referenceRemotes,
          referenceShares,
          umdExposes
        } = $injectVars
        const {interceptSystemDep} = require("umfjs")
        const interceptDeps = Object.keys(referenceShares)
          .concat(Object.keys(referenceRemotes))

        $semverhook.on("resolve", (url) => {})
        $semverhook.on("import", (url) => {
          return {
            init(){},
            async get(moduleName = "") {
              const res = await window.System.import(url)
              return function() {
                return umdExposes({
                  $umdValue: res,
                  $moduleName: moduleName
                })
              }
            }
          }
        })

        interceptSystemDep(interceptDeps, async (dep) => {
          let depValue = null
          if (referenceShares[dep]) {
            depValue = await $getShare(referenceShares[dep].import || dep, referenceShares[dep])
          } else if (referenceRemotes[dep]) {
            depValue = await $getRemote(referenceRemotes[dep])
          }
          return depValue
        })
      }
    }).apply(compiler)
  }

}

module.exports = {
  UmdPlugin,
  UniversalModuleFederationPlugin
};
