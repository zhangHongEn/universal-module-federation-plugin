import {initSharing} from "module-federation-runtime"
import global from "global"
export default function (wpmjs) {
  const inheritPrototype = require("../utils/inheritPrototype")
  
  const intercept = require("systemjs-intercept")
  function SystemClone(...params) {
    global.System.constructor.apply(this, params)
  }
  inheritPrototype(SystemClone, global.System.constructor)
  var System = new SystemClone()
  wpmjs.System = System
  intercept(function (dep) {
    if (/https?:\/\//.test(dep)) return
    return initSharing("default").then(() => wpmjs.import(dep))
  }, System)
  wpmjs.registerLoader({
    moduleType: "system",
    resolveUrl,
    resolveContainer,
    resolveEntry
  })
  wpmjs.registerLoader({
    moduleType: "umd",
    resolveUrl,
    resolveContainer,
    resolveEntry
  })


 function resolveUrl({name, version, query, entry, filename, baseUrl}) {
    if (/https?:\/\/(localhost|(\d+\.){2})/.test(baseUrl)) {
      return `${baseUrl}/${filename}`
    }
    query = query ? "?" + query : ""
    filename = filename ? "/" + filename : ""
    version = version ? "@" + version : ""
    return `${baseUrl}/${name}${version}${filename}${query}`
  }

 function resolveContainer(url) {
    return System.import(url).then(res => {
      if (typeof res === "function") {
        res.__esModule = true
        res.default = res
      }
      return res
    });
  }

 function resolveEntry(container, entry) {
    if (!entry) return container
    if (typeof container[entry] === "function") {
      return container[entry]()
    }
    if (entry in container) {
      return container[entry]
    }
    console.log("container:", container)
    throw new Error(`找不到入口模块: ${entry}`)
  }

}