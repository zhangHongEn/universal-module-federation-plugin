
const path = require("path")
const Inject = require("inject-webpack")
const PLUGIN_NAME = 'CustomDelegateModulesPlugin';
const {ContainerReferencePlugin} = require("webpack").container

/**
 * The external type of the remote containers.
 */
// remoteType;

/**
 * Container locations and request scopes from which modules should be resolved and loaded at runtime. When provided, property name is used as request scope, otherwise request scope is automatically inferred from container location.
 */
// remotes;

/**
 * The name of the share scope shared with all remotes (defaults to 'default').
 */
// shareScope;
class CustomDelegateModulesPlugin {
  constructor(options = {}) {
    const {
      workerFiles,
      ...ops
    } = options
    this.options = Object.assign({
      remoteType: "script",
    }, ops)
    // {
    //   key: internalFilePath
    // }
    this.internalFiles = this.getInternalFiles()
    this.workerFiles = workerFiles
  }
  apply(compiler) {
    new ContainerReferencePlugin(this.options).apply(compiler)
    new Inject(() => {
      return this.internalFiles.map(file => `require("${file}")`).join(";")
    }, {
      extraInjection: this.workerFiles
    }).apply(compiler)
  }
  getInternalFiles() {
    const internalFiles = []
    Object.keys(this.options.remotes).forEach(key => {
      const internalFilePath = String(this.options.remotes[key]).replace("internal ", "")
      if (internalFilePath) internalFiles.push(internalFilePath)
    })
    return internalFiles
  }
}

module.exports = CustomDelegateModulesPlugin;
