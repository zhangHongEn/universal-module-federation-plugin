const resolvePlugin = require('./resolver/resolvePlugin')
const resolveDevSever = require('./resolver/resolveDevServer.js')
const resolveServer = require('./resolver/resolveServer')
const {isMultiEntry, isWebpack5,WPM_PLUGIN_NAME} = require("./utils/index");
const {isDevelopment} = require("./utils");

let WPM_BUILD_FAILED = true //打包过程是否出错

class DevServerPoolPlugin {
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
    hooks.environment.tap(WPM_PLUGIN_NAME, async function () {
      resolveDevSever(compiler)
      await resolveServer()
    });

  }
}

module.exports = DevServerPoolPlugin
module.exports.resolveDevServer = resolveServer