var _global = typeof self === "undefined" ? global : self
if (!_global.System) {
  require("systemjs/dist/s")
  require("systemjs/dist/extras/amd")
  require("systemjs/dist/extras/global")
  require("systemjs/dist/extras/use-default")
}
module.exports = function (cb, System) {
  System = System || _global.System
  var sysProto = Object.getPrototypeOf(System)

  const EventBus = require("./utils/eventbus")
  var eventBus = System.$_intercept_event || new EventBus()
  System.$_intercept_event = eventBus

  var tag = "https://module-federation.virtual.com/$intercept/"
  // 这两处systemjs hook可以使用System.set替代, 但是set在s.js没有, 而system.js依赖的处理顺序有bug
  // const existingHookResolve = System.constructor.prototype.resolve;
  sysProto.resolve = function (url, parentUrl) {
    var interceptUrl = tag + url
    return interceptUrl
  };

  var existingHookCreateContext = sysProto.createContext;
  sysProto.createContext = function (url) {
    var oriContext = existingHookCreateContext.call(this, url);
    var newContext = Object.assign(oriContext)
    newContext.url = oriContext.url.replace(tag, "")
    return newContext
  }

  var existingHookInstantiate = sysProto.instantiate;
  sysProto.instantiate = function (url) {
    var oriUrl = url.replace(tag, "")
    var depRes = eventBus.emit("importDep", [oriUrl])
    if (depRes) {
      return [[], function(_export, _context) {
        return {
          execute: function() {
            return Promise.resolve(depRes).then(function(res) {
              _export(res)
            })
          },
          setters: []
        }
      }]
    }
    return existingHookInstantiate.call(this, oriUrl);
  };

  eventBus.on("importDep", cb)
  return function() {
    eventBus.off("importDep", cb)
  }
}