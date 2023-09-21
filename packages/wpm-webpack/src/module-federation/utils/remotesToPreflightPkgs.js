const {globalToName} = require("module-federation-runtime/src/extraExport/mf-name-utils")
module.exports = function(remotes = {}) {
  return Object.keys(remotes).map(key => globalToName(remotes[key].split("@")[0]))
}