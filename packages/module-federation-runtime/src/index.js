
import {findShared as _findShared} from "./utils/findShared"
import loadScript from "./utils/loadScript"

function getDefaultShareScopes() {
  return typeof __webpack_share_scopes__ === "undefined" ? 
    typeof __global_share_scopes__ === "undefined" ? {} : __global_share_scopes__
   : __webpack_share_scopes__
}

var _global = typeof self === "undefined" ? global : self
_global.__global_share_scopes__ = getDefaultShareScopes()
var _shareScopes = _global.__global_share_scopes__

export const remotes = {
  // [global]: {
  //   url,
  //   shareScope,
  //   container,
  //   containerPromise
  // }
}
export const shareScopes = _shareScopes

export function initShared(shareScopeKey, shareScopes){
  shareScopes = shareScopes || _shareScopes
  if (!shareScopes[shareScopeKey]) shareScopes[shareScopeKey] = {}
}

export function registerShared(shared = {}, shareScopes){
  shareScopes = shareScopes || _shareScopes
  Object.keys(shared).forEach(name => {
    const {get, version, loaded = false, from = "", shareScope = "default"} = shared[name]
    initShared(shareScope, shareScopes)
    if (!version) throw new Error("version is required")
    if (!name) throw new Error("name is required")
    
    shareScopes[shareScope][name] = shareScopes[shareScope][name] || {}
    shareScopes[shareScope][name][version] = {
      fromType: "runtime",
      from,
      loaded,
      get
    }
  })
}

export function findShared(shareConfig, shareScopes){
  shareScopes = shareScopes || _shareScopes
  return _findShared(shareConfig, shareScopes)
}

export function registerRemotes(registerRemotes = {}, customLoadScript, shareScopes){
  shareScopes = shareScopes || _shareScopes
  const useLoadScript = customLoadScript || loadScript
  const containersIniting = Object.keys(registerRemotes)
    .map(global => {
      var container = _global[global]
      var url = registerRemotes[global].url
      var shareScope = registerRemotes[global].shareScope || "default"
      initShared(shareScope, shareScopes)
      if (container) {
        // 已有remote, 复用
        return {
          url,
          shareScope,
          container,
          containerPromise: Promise.resolve(container)
        }
      }
      if (remotes[global]) {
        // 重复注册remote, 复用
        return remotes[global]
      }
      remotes[global] = {
        url,
        shareScope,
        container: null,
        containerPromise: useLoadScript(url)
          .then(customContainer => {
            var container = customContainer || _global[global]
            if (!container) {
              if (!container) throw new Error(`not found container from global["${global}"]`)
            }
            remotes[global].container = container
            return container.init(shareScopes[shareScope])
          })
      }
      return remotes[global].containerPromise
    })
  return Promise.all(containersIniting)
}

export function findRemote(global){
  const container = _global[global]
  if (!container) throw new Error(`not found container from global["${global}"]`)
  return container
}

export async function findModule(global, path){
  const container = _global[global]
  if (!container) throw new Error(`not found container from global["${global}"]`)
  return await container.get(path)
}