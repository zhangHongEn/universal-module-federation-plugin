const Port = require("webpack-port-collector")
const NpmFederation = require("npm-federation")

class WpmPlugin {
  constructor(options) {
    this.options = options
    const {
      name,
      initial,
      config,
      debugQuery,
      remotes,
      ...ops
    } = Object.assign({
      name: "",
      initial: "",
      config: {},
      debugQuery: "",
      remotes: {}
    }, options)
  }
  apply(compiler) {
    if (this.options.filename && this.options.name) {
      new Port({
        packageName: this.options.packageName,
        filename: this.options.filename
      }).apply(compiler)
    }
    new NpmFederation(this.options).apply(compiler)
  }
}

module.exports = WpmPlugin