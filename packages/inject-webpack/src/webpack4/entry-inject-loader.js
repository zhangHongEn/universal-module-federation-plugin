const {getOptions} = require("loader-utils")
module.exports = function lod (source, map, meta) {
  const loaderOptions = getOptions(this)
  if (module.exports.injectMap[`${loaderOptions.injectId}__entryResources`].has(this.resourcePath + this.resourceQuery)) {
    return `
    ${module.exports.injectMap[`${loaderOptions.injectId}__code`]}
    \r\n;
    ${source}
    `
  }
  return source
}

module.exports.injectMap = {
  // [${injectId}__code],
  // [${injectId__entryResources}]
}