const path = require("path")
const fs = require("fs")
/**
 * 获取依赖的路径
 * @param {*} dep 
 * @param {*} context 
 */
 module.exports.getEntrysPath = function({dep, context, extensions = []}) {
  if (dep.request) {
    // 绝对路径直接返回, 相对路径拼上context
    const request = /^(.:|\/)/.test(dep.request) ? dep.request : path.join(context, dep.request)
    for (var extension of [""].concat(extensions)) {
      if (fs.existsSync(request + extension)) {
        return [request + extension]
      }
    }
    return [request]
  }
  return dep.dependencies
    .filter(dep => dep.constructor.name.indexOf("EntryDependency") > -1)
    .map(dep => module.exports.getEntrysPath({dep, context, extensions})[0])
}
