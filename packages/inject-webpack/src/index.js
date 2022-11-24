function getWebpackVersion(compiler) {
  try {
    if (compiler.webpack.version.split(".")[0] == 5) {
      return 5
    }
  } catch (e) {
  }
  return 4
}

module.exports = class InjectPluginEntry {
  constructor(code, options) {
    this.code = code
    this.options = options
  }
  apply(compiler) {
    const version = getWebpackVersion(compiler)
    if (version === 5) {
      const Plugin = require("./webpack5/plugin")
      new Plugin(this.code, this.options).apply(compiler)
    } else {
      const Plugin = require("./webpack4/plugin")
      new Plugin(this.code, this.options).apply(compiler)
    }
  }
}