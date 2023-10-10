``` js
require("systemjs-intercept")(function (dep) {
  // 能够拦截system的请求, 包含依赖
  // 比如请求npm cdn的react-dom模块, 其依赖"react"
  if (dep === "react") {
    return window.System.import("https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js")
    // 可以返回自定义值
    // return {
    //   test: "react"
    // }
  }
}, window.System)
console.log(111, window.System.import("https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js"))
```


``` js
const newSystem = new window.System.constructor()
require("systemjs-intercept")(function (dep) {
  // 能够拦截system的请求, 包含依赖
  // 比如请求npm cdn的react-dom模块, 其依赖"react"
  if (dep === "react") {
    return newSystem.import("https://cdn.jsdelivr.net/npm/react@18.2.0/umd/react.development.js")
    // 可以返回自定义值
    // return {
    //   test: "react"
    // }
  }
}, )
console.log(111, newSystem.import("https://cdn.jsdelivr.net/npm/react-dom@18.2.0/umd/react-dom.development.js"))
```