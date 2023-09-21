import _global from "global"
import {registerRemotes} from "module-federation-runtime"
const {nameToGlobal} = require("module-federation-runtime/src/extraExport/mf-name-utils")

export default function(wpmjs) {
  wpmjs.registerLoader({
    moduleType: "mf",
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
  
  async function resolveContainer(url, {requestObj, pkgConfig}) {
    const global = pkgConfig.global || nameToGlobal(requestObj.name)
    await registerRemotes({
      [global]: {
        url
      }
    })
    return _global[global]
  }
  
  function resolveEntry(container, entry) {
    // entry的格式化, 自动增加./前缀
    // 1. "App" => "./App"
    // 2. "/App" => "./App"
    // 3. "./App" => "./App"
    if (entry === "./") {
      return container
    }
    entry = entry.replace(/^(\.?\/)?/, "./")
    return container.get(entry.replace(/^(\.?\/)?/, "./"))
      .then(factory => factory())
  }
  
}
