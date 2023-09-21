## 

## api

``` js
const NPMFederation = require("npm-federation")
new NPMFederation({
  config: {
    baseUrl: "https://cdn.jsdelivr.net/npm"
  },
  remotes: {
    "@remix-run/router": "@remix-run/router@1.0.3/dist/router.umd.min.js",
  }
})
```

## 自定义url规则

## systemjs多入口规范