import {findShared as _findShared} from "./utils/findShared"
import loadScript from "./utils/loadScript"
import _global from "global"

function getDefaultShareScopes() {
  if (typeof __global_share_scopes__ === "undefined") {
    return typeof __webpack_share_scopes__ === "undefined"
      ? {}
      : __webpack_share_scopes__
  }

  return __global_share_scopes__
}

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
export const remoteInitPromises = []
export const shareScopes = _shareScopes

export function initShared(shareScopeKey, shareScopes){
  shareScopes = shareScopes || _shareScopes
  if (!shareScopes[shareScopeKey]) shareScopes[shareScopeKey] = {}
  return Promise.all([remoteInitPromises]).then(() => 1)
}

export const initSharing = initShared

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
      get(...params) {
        shareScopes[shareScope][name][version].loaded = 1
        return get.apply(this, params)
      }
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
        const containerPromise = Promise.resolve(container)
        remoteInitPromises.push(containerPromise)
        return {
          url,
          shareScope,
          container,
          containerPromise
        }
      }
      if (remotes[global]) {
        // 重复注册remote, 复用
        return remotes[global].containerPromise
      }
      const containerPromise = Promise.resolve(useLoadScript(url, global))
        .then(async customContainer => {
          var container = customContainer || _global[global]
          if (!container) {
            if (!container) throw new Error(`not found container from global["${global}"]`)
          }
          remotes[global].container = container
          await container.init(shareScopes[shareScope])
          return container
        })
      remoteInitPromises.push(containerPromise)
      remotes[global] = {
        url,
        shareScope,
        container: null,
        containerPromise
      }
      return remotes[global].containerPromise
    })
  return Promise.all(containersIniting)
}

export async function findRemote(global){
  const container = await remotes[global]?.containerPromise || _global[global]
  if (!container) throw new Error(`not found container from global["${global}"]`)
  return container
}

export async function findModule(global, path){
  const container = await findRemote(global)
  if (!container) throw new Error(`not found container from global["${global}"]`)
  return (await container.get(path))()
}