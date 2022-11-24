var resolveRequest = require("./utils/resolveRequest")

module.exports = function () {
  var semverhook = {}
  var cacheMap = {
    // [id]: {
    //   url,
    //   moduleResult,
    //   moduleResultSync
    // }
  }

  var eventMap = {
    // [eventName]: listeners
  }

  function emit(eventName, args) {
    var listeners = eventMap[eventName] || []
    var result
    for (var index = 0; index < listeners.length; index++) {
      result = listeners[index].apply(semverhook, args) || result;
    }
    return result
  }

  /**
   * 
   * @param {*} request {name, version, entry, query}
   */
  function resolve(id) {
    var url = id
    var request
    if (!(/^https?:\/\//.test(id))) {
      try {
        request = resolveRequest(id)
      } catch (e) {

      }
      if (request) {
        request = emit("resolveRequest", [request]) || request
        url = emit("resolvePath", [request]) || url
      }
    }
    if (cacheMap[id]) {
      cacheMap[id].url = url
    }
    return {
      url,
      request
    }
  }

  function importFn(id) {
    if (cacheMap[id]) return cacheMap[id].resultModule
    cacheMap[id] = {}
    id = id || ""
    return Promise.resolve(emit("beforeImport", [id]) || id).then(function (id) {
      const {url, request} = resolve(id)
      var resultModule = emit("import", [url, request])
      cacheMap[id].resultModule = resultModule
      Promise.resolve(resultModule).then(function (val) {
        cacheMap[id].resultModuleSync = val
      })
      return resultModule
    })
  }

  semverhook.import = importFn

  semverhook.resolve = function(id) {
    return resolve(id).url
  }

  semverhook.get = function(id) {
    return cacheMap[id] ? cacheMap[id].resultModule : null
  }
  semverhook.getSync = function(id) {
    return cacheMap[id] ? cacheMap[id].resultModuleSync : null
  }

  semverhook.on = function (eventName, cb) {
    if (!eventMap[eventName]) {
      eventMap[eventName] = []
    }
    eventMap[eventName].push(cb)
  }

  semverhook.off = function (eventName, cb) {
    if (!eventMap[eventName]) return
    var eventIndex = eventMap[eventName].indexOf(cb)
    if (eventIndex > -1) {
      eventMap[eventName].splice(eventIndex, 1)
    }
  }

  semverhook.emit = emit

  return semverhook
}