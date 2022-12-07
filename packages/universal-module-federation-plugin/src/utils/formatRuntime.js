module.exports = function formatRuntime(runtime = {}) {
  if (typeof runtime === "string") return runtime
  if (typeof runtime === "function") {
    runtime = runtime(this)
  }
  runtime = Object.assign({
    get({module, request}) {
      return module
    },
  }, runtime);
  ["initial", "beforeImport", "resolvePath", "resolveRequest", "import"].forEach(key => {
    if (!runtime[key]) {
      runtime[key] = []
    }
    if (!(runtime[key] instanceof Array)) {
      runtime[key] = [runtime[key]]
    } 
  })
  return runtime
}