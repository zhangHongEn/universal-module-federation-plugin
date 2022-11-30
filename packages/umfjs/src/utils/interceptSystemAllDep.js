module.exports = function () {
  if (!window.System) {
    require("systemjs/dist/s")
    require("systemjs/dist/extras/amd")
    require("systemjs/dist/extras/global")
    require("systemjs/dist/extras/use-default")
  }
  var System = new window.System.constructor()
  var sysProto = {}
  Object.setPrototypeOf(System, Object.assign(sysProto, System.constructor.prototype))

  const eventBus = require("semverhook")()
  
  // 这两处systemjs hook可以使用System.set替代, 但是set在s.js没有, 而system.js依赖的处理顺序有bug
  // const existingHookResolve = System.constructor.prototype.resolve;
  sysProto.resolve = function (url, parentUrl) {
    const interceptUrl = `https://module-federation.virtual.com/$intercept/${url}`
    return interceptUrl
  };

  const existingHookInstantiate = sysProto.instantiate;
  sysProto.instantiate = function (url) {
    const oriUrl = url.replace(`https://module-federation.virtual.com/$intercept/`, "")
    const depRes = eventBus.emit("importDep", [oriUrl])
    if (depRes) {
      return [[], function(_export, _context) {
        return {
          async execute() {
            const res = await depRes
            _export(res)
          },
          setters: []
        }
      }]
    }
    return existingHookInstantiate.call(this, oriUrl);
  };

  return {
    eventBus,
    System
  }
}