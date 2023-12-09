## 

## api

<!-- // Inject some code through initial (not required)
  initial: `
    console.log("Inject code wpmjsInstance", wpmjs)
    wpmjs.sleep(new Promise(resolve => {
      // fetch("https://xxxxx.json")
      const json = {
        "@remix-run/router": {
          packageVersion: "1.9.0"
        }
      }
      setTimeout(() => {
        console.log("Asynchronously obtain data and dynamically set the remotes version", json)
        wpmjs.addImportMap(json)
        resolve()
      }, 100)
    }))
  `, -->
``` js
const NPMFederation = require("npm-federation")
new NPMFederation({
  remotes: {
    "@remix-run/router": "https://cdn.jsdelivr.net/npm/@remix-run/router@1.0.3/dist/router.umd.min.js",
    "mf-app-02": "mfapp02@https://cdn.jsdelivr.net/npm/mf-app-02@latest/dist/remoteEntry.js",
  },
  shared: {react: {}}
})
```

``` js
const NPMFederation = require("npm-federation")
new NPMFederation({
  baseUrl: "https://cdn.jsdelivr.net/npm",
  remotes: {
    "@remix-run/router": "@remix-run/router@1.0.3/dist/router.umd.min.js",
    "mf-app-02": {
      package: "mf-app-02@latest/dist/remoteEntry.js",
      global: "mfapp02"
    },
  },
  shared: {react: {}}
})
```

<!-- ## 自定义url规则

## systemjs多入口规范 -->
