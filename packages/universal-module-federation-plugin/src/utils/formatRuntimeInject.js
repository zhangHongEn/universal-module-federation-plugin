module.exports = function formatRuntimeInject(runtimeInject = {}) {
  if (typeof runtimeInject === "function") {
    runtimeInject = runtimeInject(this)
  }
  ["initial", "beforeImport", "resolvePath", "resolveRequest", "import"].forEach(key => {
    if (!runtimeInject[key]) {
      runtimeInject[key] = []
    }
    if (!(runtimeInject[key] instanceof Array)) {
      runtimeInject[key] = [runtimeInject[key]]
    } 
  })
  return runtimeInject
}