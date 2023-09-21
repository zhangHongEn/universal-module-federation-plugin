
import localStorage from './utils/getLocalStorage';
import parseURLQuery from './utils/parseURLQuery';
import global from "global"
const queryInfo = parseURLQuery();

export default function (wpmjs) {
  if (localStorage.getItem('wpm-debug-open') != 1) return
  const wpmAlias = (function () {
    try {
      return JSON.parse(localStorage.getItem("wpm-alias")) || []
    } catch (e) {
      return {}
    }
  })()
  const wpmPkgList = (function () {
    try {
      return JSON.parse(localStorage.getItem("wpm-pkgList")) || []
    } catch (e) {
      return []
    }
  })()
  const wpmActivePkgMap = (function () {
    try {
      return JSON.parse(localStorage.getItem('wpm-activePkgMap')) || {}
    } catch (e) {
      return {}
    }
  })()
  wpmPkgList.forEach(({name: pkg, url}) => {
    if (!wpmActivePkgMap[pkg]) return
    wpmjs.addImportMap({
      [pkg]: {
        url: url
      }
    })
  })
  wpmAlias.forEach(({source, target}) => {
    wpmjs.addImportMap({
      [source]: {
        packageVersion: target
      }
    })
  })
  
}

export async function debug(config) {
  if("wpmDebug" in queryInfo && localStorage.getItem('wpm-debug-open') != 1) {
    localStorage.setItem('wpm-debug-open', 1);
    setTimeout(() => {
      location.reload()
    }, 0);
  }
  const wpmjsDebug = global.wpmjsDebug
  wpmjsDebug.setConfig({
    baseUrl: (config || {}).baseUrl
  })
  wpmjsDebug.addImportMap({
    [`wpm-develop-panel`]: {
      packageName: "wpm-develop-panel",
      moduleType: "system",
      packageFilename: "dist/index.js",
      // packageFilename: "index.js",
      // url: `http://localhost:8082`
    },
    "react-dom": "react-dom@18.2.0/umd/react-dom.development.js",
    "react": "react@18.2.0/umd/react.development.js",
  })
  wpmjsDebug.addImportMap({
    "react-dom": {
      shareScope: "wpmjsDebug"
    },
    "react": {
      shareScope: "wpmjsDebug"
    }
  })
  const {default: init} = await wpmjsDebug.import("wpm-develop-panel")
  init(config)
}