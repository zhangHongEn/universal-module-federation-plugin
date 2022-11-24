
module.exports = function lod (source, map, meta) {
  if (module.exports.injectMap[`${this.getOptions().injectId}__entryResources`].has(this.resourcePath + this.resourceQuery)) {
    return `
    ${module.exports.injectMap[`${this.getOptions().injectId}__code`]}
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