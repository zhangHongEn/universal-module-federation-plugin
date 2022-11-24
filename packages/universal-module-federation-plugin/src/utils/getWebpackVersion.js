module.exports = function getWebpackVersion(compiler) {
  try {
    if (compiler.webpack.version.split(".")[0] == 5) {
      return 5
    }
  } catch (e) {
  }
  return 4
}