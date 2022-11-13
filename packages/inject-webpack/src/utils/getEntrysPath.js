const path = require("path")
const fs = require("fs")

function getModulePath(dep, context, extensions) {
  if (dep.request) {
    // 绝对路径直接返回, 相对路径拼上context
    const request = /^(.:|\/)/.test(dep.request) ? dep.request : path.join(context, dep.request)
    for (var extension of [""].concat(extensions)) {
      if (fs.existsSync(request + extension)) {
        return request + extension
      }
    }
    return request
  }
}

/**
 * 获取依赖的路径
 * @param {*} dep 
 * @param {*} context 
 */
 module.exports = function getEntrysPath({entry, context, extensions = [], hasExposes = false, hasEntry = false}) {
  if (entry.exposes instanceof Array) {
    if (!hasExposes) {
      return []
    }
    var paths = []
    entry.exposes.forEach(expo => {
      expo[1].import.forEach(path => {
        paths.push(getModulePath({
          request: path
        }, context, extensions))
      })
    })
    return paths
  }
  if (hasEntry) {
    return [getModulePath(entry, context, extensions)]
  }
  return []
  // return dep.dependencies
  //   // .filter(dep => dep.constructor.name.indexOf("EntryDependency") > -1)
  // .map(dep => getEntrysPath(dep, context, extensions)[0])
}
