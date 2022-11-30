module.exports = function resolveRequest(id = "") {
  var {1: name, 5: version = '', 7: entry = "", 9: query = ""} = id.match(/^((@[^/]+?\/)?([^/@?]+))(@([^/?]+?))?(\/([^?]+?))?(\?(.+?))?$/) || []
  if (!id || !name) throw new Error("id error:" + id)
  return {
    entry,
    name,
    version,
    query
  }
}
module.exports.default = module.exports