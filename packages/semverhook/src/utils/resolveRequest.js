module.exports = function resolveRequest(id = "") {
  var {1: name, 5: version = '', 7: entry = "", 9: query = ""} = id.match(/^((@[_\-A-Za-z\d]+\/)?([_\-A-Za-z\d]+))(@([^/]+?))?(\/([_\-A-Za-z\d/]+))?(\?(.+?))?$/) || []
  if (!id || !name) throw new Error("id error:" + id)
  return {
    entry,
    name,
    version,
    query
  }
}
module.exports.default = module.exports