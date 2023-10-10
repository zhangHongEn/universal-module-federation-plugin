## wpmjs（web package manager）

能够加载umd、system、module-federation并共享依赖的加载器

* 基于npm和module-federation的版本化远程模块管理器

## 特性
* 多模块规范（集成了system、umd、module-federation等模块规范）
* 调试模式/热更新（集成了调试面板与热更新, 可以自动连接本地启动的dev-server）
* 版本化管理（可以使用私有或公共npm作为远程模块存储源, 也可以自定义url拼接规则自行存储远程模块）
* 远程锁（支持动态配置远程模块的版本）
* 性能优化（插件自动化优化多个远程模块及其chunk的加载链路, 避免多次加载的等待）



``` js
require("../src/index")

const wpmjs = window.wpmjs

const wpmjs1 = new wpmjs.constructor({
  name: "wpmjs1"
})

wpmjs.setConfig({
  baseUrl: "https://cdn.jsdelivr.net/npm",
})


wpmjs1.setConfig({
  baseUrl: "https://cdn.jsdelivr.net/npm"
})

wpmjs1.addImportMap({
  "react-dom": {
    "packageVersion": "18.1.0",
    // strictVersion: true
  },
  "react": {
    "packageVersion": "18.1.0"
  },
})
wpmjs1.addImportMap({
  "antd": "antd@5.9.0/dist/antd.min.js",
  "dayjs": "dayjs@1.11.1",
  "react-dom": "react-dom/umd/react-dom.development.js",
  "react": "react/umd/react.development.js",
  "mf-app-01": {
    package: "mf-app-01@1.0.5/dist/remoteEntry.js",
    global: "mfapp01"
  }
})

wpmjs.addImportMap({
  "antd": "antd@5.9.0/dist/antd.js",
  "dayjs": "dayjs@1.11.1",
  "react-dom": {
    "packageVersion": "18.2.0",
    // strictVersion: true
  },
  "react": {
    "packageVersion": "18.2.0"
  },
})
wpmjs.addImportMap({
  "react-dom": "react-dom/umd/react-dom.development.js",
  "react": "react/umd/react.development.js",
  "mf-app-01": {
    package: "mf-app-01@1.0.8/dist/remoteEntry.js",
    global: "mfapp01"
  },
  "mf-app-02": {
    package: "mf-app-02@1.0.5/dist/remoteEntry.js",
    global: "mfapp02"
  }
})

// 卡住两次wpmjs的加载
// window.wpmjs.sleep(new Promise(resolve => {
//   setTimeout(() => {
//     resolve()
//     window.wpmjs.sleep(new Promise(resolve => {
//       setTimeout(() => {
//         resolve()
//       }, 1000)
//     }))
//   }, 1000);
// }))

;(async function main() {
  wpmjs1.import("react-dom")
  const [React, reactDom] = await Promise.all(["react", "react-dom"].map(pkg => wpmjs.import(pkg)));
  const [
    dayjs
  ] = await Promise.all(["dayjs"].map(pkg => wpmjs.import(pkg)));
  window.dayjs = dayjs
  const [
    App1,
    antd,
  ] = await Promise.all(["mf-app-01/App", "antd", "mf-app-02/App"].map(pkg => wpmjs.import(pkg)));

  const div = document.createElement("div")
  document.body.appendChild(div)
  reactDom.render(React.createElement("div", {}, [
    React.createElement(App1.default),
    React.createElement(antd.DatePicker.RangePicker, {
      placeholder: ["antd", "RangePicker"],
    }),
    React.createElement(antd.Button, {}, ["antd button"]),
  ]), div)
})();
// global.wpmjs.debug({
//   baseUrl: "https://cdn.jsdelivr.net/npm"
// })
```



## 贡献指南
1. 补充单测（wpmjs sdk）
2. 调试面板（增加映射配置, 可以配置某个包的版本映射）
3. 本地端口池插件（鹏的插件, 需要与wpm-webpack和调试面板集成）
4. vite插件、rspack插件（使用@module-federation/vite实现; 持续关注rspack最新mf动态）
5. demo（各种demo仓库的建设）
6. 文档（概念、教程、相关规范、性能优化原理与优势）
7. 可以给webpack官方贡献性能优化的代码（详见chunkMap部分。https://github.com/module-federation/universe/discussions/1170）
8. 浏览器插件（调试面板插件版本, 只需要读取ws, 设置localstorage）
9. qiankun需要设置global加publicPath
10. 热更新指定方式
11. 插件开发方式, 插件自动引入api实现, debug 参数实现
12. wpm-develop-preview插件开发, 类似一个story book
13. wpm-develop-panel可以拖动, 缓存折叠展开状态





## api与插件设计（草稿版）

``` js
wpmjs.setConfig({
  baseUrl: "https://cdn.jsdelivr.net/npm",
  map: {
    react: "react/umd/react.development.js"
  }
})

wpmjs.sleep()
wpmjs.import()
wpmjs.get()
wpmjs.on()

wpmjs.registerLoader({
  moduleType: "mf",
  resolveUrl(){},
  resolveContainer(){},
  resolveEntry(){}
})

wpmjs.import("react@1.1")

wpmPlugin({
  rootApp: true,
  async initial() {
    window.wpmjs.sleep(() => fetch(json)
    .then(json => {
      window.wpmjs.mergeConfig({
        map: json
      })
    }))
  },
  baseUrl: "https://cdn.jsdelivr.net/npm",
  debug: {
    plugins: [
      "connect",
      "alias",
      "hmr"
    ]
  },
  remotes: {
    react: "react@19.0.0/mf/remoteEntry.js",
    react: "react@19.0.0/mf/index.js",
    react1: {
      package: "react@19.0.0/mf/index.js",
      moduleType: "mf",
      url: ""
    }
  },
})
```
