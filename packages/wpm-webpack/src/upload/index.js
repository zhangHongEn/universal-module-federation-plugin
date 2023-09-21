const resolvePlugin = require('../dev-server/resolver/resolvePlugin')
const {resolveLocalLibMap} = require('./resolver/resolveLocalLibMap.js')
const resolveToCli = require('./resolver/resolveToCli')
const {isMultiEntry, isWebpack5,WPM_PLUGIN_NAME} = require("../dev-server/utils");
const {isDevelopment} = require("../dev-server/utils");

let WPM_BUILD_FAILED = true //打包过程是否出错

class WpmUploadPlugin {
  constructor(options) {
    resolvePlugin(options)
    this.options = options || {};
  }

  async apply(compiler) {
    //提前配置变量
    isDevelopment(compiler.options)
    isWebpack5(compiler)
    isMultiEntry(compiler.options)

    const hooks = compiler.hooks;
    hooks.done.tapPromise(WPM_PLUGIN_NAME, function (stats) {
      return resolveLocalLibMap(stats)
    });

    hooks.failed.tap(WPM_PLUGIN_NAME,function (){
      if (isDevelopment() === false){ //监听生产环境打包是否出错
        WPM_BUILD_FAILED = true
      }
    })

    hooks.afterEmit.tapAsync(WPM_PLUGIN_NAME, async(compilation, callback) => {
      WPM_BUILD_FAILED = false
      callback()
    });

    process.on('beforeExit', async (code) => {
      if (this.options.autoUpload && isDevelopment() === false && WPM_BUILD_FAILED === false) {
        try {
          await resolveToCli(compiler);
        } catch (e) {

        }finally {
          process.exit()
        }
      } else {
        // process.exit()
      }
    });
  }
}

module.exports = WpmUploadPlugin