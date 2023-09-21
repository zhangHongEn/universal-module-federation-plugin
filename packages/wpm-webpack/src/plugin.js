const MF = require("./module-federation/plugin")
const resolveDevServer = require("./dev-server/resolver/resolveDevServer")
const DevServerPoolPlugin = require("./dev-server/index")
const WpmUploadPlugin = require("./upload")
const SingleReactRefresh = require("single-react-refresh-plugin")

module.exports = class WpmPlugin {
  static resolveDevServer = resolveDevServer
  static DevServerPoolPlugin = DevServerPoolPlugin
  constructor(options) {
    this.options = options
  }
  apply(compiler) {
    const {
      // app,
      ...options
    } = this.options
    new MF(options).apply(compiler)
    // if (!app) {
    //   new DevServerPoolPlugin(options).apply(compiler)
    //   new WpmUploadPlugin(options).apply(compiler)
    // }
    new SingleReactRefresh().apply(compiler)
  }
}