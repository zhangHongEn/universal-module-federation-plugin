

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

  }
}

module.exports = WpmPlugin