
const { entryResources, injectArray } = require('./entry-inject-loader');
const getEntrysPath = require('./utils/getEntrysPath');
const injectLoader = require('./utils/injectLoader');
const entryInjectLoaderPath = require.resolve("./entry-inject-loader")
const VirtualPlugin = require("webpack-virtual-modules")
const ImportDependency = require("webpack/lib/dependencies/ImportDependency")
const { RawSource } = require('webpack-sources');
const Template = require("webpack/lib/Template")
const ContainerEntryModule = require("webpack/lib/container/ContainerEntryModule")
const PLUGIN_NAME = 'InjectPlugin';

let loaderId = 0

class InjectPlugin {
  constructor(code, options = {}) {
    options = Object.assign({
      scopes: ["entry", "remoteEntry"]
    }, options)
    this.options = options
    // options = {
    //   // entry 注入到所有入口
    //   // remoteEntry 注入module-federation的 remoteEntry
    //   // exposesEntry 注入module-federation的exposes暴露的每个入口
    //   // scope: ["entry", "remoteEntry", "exposesEntry"]
    // }
    this.injectCodeFn = code
    this.loaderId = ++loaderId
    this.virtualSemverPath = `${process.cwd()}/$_injectPlugin_${this.loaderId}.js`
  }
  apply(compiler) {
    new VirtualPlugin({
      [this.virtualSemverPath]: this.injectCodeFn()
    }).apply(compiler)

    this.addLoader(compiler)

    const scopes = this.options.scopes
    const hasEntry = scopes.indexOf("entry") > -1
    const hasExposes = scopes.indexOf("exposesEntry") > -1
    const hasRemoteEntry = scopes.indexOf("remoteEntry") > -1
    if (hasEntry || hasExposes) {
      injectArray.push(() => {
        return `;require(${JSON.stringify(this.virtualSemverPath)});`
      })

      compiler.hooks.thisCompilation.tap(PLUGIN_NAME, (compilation) => {
        compilation.hooks.addEntry.tap(PLUGIN_NAME, (entry) => {
          getEntrysPath({
            entry,
            context: compilation.options.context,
            extensions: compiler.options.resolve.extensions.concat(['.js', '.json', '.wasm']),
            hasEntry,
            hasExposes
          }).forEach(path => {
            entryResources.add(path)
          })
        })
      })
    }

    compiler.hooks.compilation.tap(PLUGIN_NAME, (compilation) => {
      if (hasRemoteEntry) {
        this.injectRemoteEntry(compilation)
      }
    })

  }

    /**
    * 注册loader
    * @param {*} compiler 
    */
   addLoader(compiler) {
    const entryInjectMatch = function (moduleData) {
      return /\.([cm]js|[jt]sx?|flow)$/i.test(moduleData.resourceResolveData.path)
    };
    compiler.hooks.compilation.tap(
      PLUGIN_NAME,
      (compilation, { normalModuleFactory }) => {
        normalModuleFactory.hooks.afterResolve.tap(
          this.constructor.name,
          // Add loader to process files that matches specified criteria
          (resolveData) => {
            injectLoader(resolveData.createData, {
              match: entryInjectMatch,
              options: {
                const: compilation.runtimeTemplate.supportsConst(),
                esModule: false,
              },
            }, entryInjectLoaderPath);
          }
        );
      })
  }

  injectRemoteEntry(compilation) {
    const containerEntryModules = []
    compilation.hooks.buildModule.tap(PLUGIN_NAME, module => {
      if (module instanceof ContainerEntryModule) {
        // module.addDependency(new ImportDependency(this.virtualSemverPath, [0, 0], null))
        containerEntryModules.push(module)
      }
    });

    compilation.hooks.afterCodeGeneration.tap(PLUGIN_NAME, () => {
      containerEntryModules.forEach(module => {
        const sourceMap = compilation.codeGenerationResults.get(module).sources;
          const rawSource = sourceMap.get('javascript');
          sourceMap.set(
              'javascript',
              new RawSource(
                Template.asString([
                  `__webpack_require__("./$_injectPlugin_${this.loaderId}.js")`,
                  rawSource.source()
                ])
              )
          );
      })
    })

  }
}

module.exports = InjectPlugin
