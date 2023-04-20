/**
 * 遵循npm包名 + 版本号规则来解析请求字符串
 * @param {*} request `@[scope]/[name]@[version]/[entry]?[query]`
 * @returns {name, version, entry, query}
 */
export default function parseRequest(request = "") {
  var {1: name, 5: version = '', 7: entry = "", 9: query = ""} = request.match(/^((@[^/]+?\/)?([^/@?]+))(@([^/?]+?))?(\/([^?]+?))?(\?(.+?))?$/) || []
  if (!request || !name) throw new Error("id error:" + request)
  return {
    entry,
    name,
    version,
    query
  }
}