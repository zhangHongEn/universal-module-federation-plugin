const path = require('path')

module.exports = function load(source) {
  const importPath = path.resolve(__dirname,'setPublicPath.js').replace(/\\/g, "\\\\")
  const inject = `require('${importPath}');\r\n`
  return inject + source
}