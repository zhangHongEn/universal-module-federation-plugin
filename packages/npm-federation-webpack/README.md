## 

## api

``` js
WpmWebpack({
  async initial({wpmjs}) {
    // wpmjs.sleep(() => fetch(json)
    // .then(json => {
    //   wpmjs.addImportMap({
    //     "react": {packageVersion: "17.0.2"},
    //     "react-dom": {packageVersion: "17.0.2"}
    //   })
    // }))
  },
  baseUrl: "https://cdn.jsdelivr.net/npm",
  // debug: {
  //   plugins: [
  //     "connect",
  //     "alias",
  //   ]
  // },
  remotes: {
    "antd": "antd@5.9.0/dist/antd.min.js",
    "dayjs": "dayjs@1.11.1",
    "react-dom": "react-dom/umd/react-dom.development.js",
    "react": "react/umd/react.development.js",
    "mf-app-01": {
      package: "mf-app-01@latest/dist/remoteEntry.js",
      global: "mfapp01"
    }
  },
})
```

## 自定义url规则

## systemjs多入口规范