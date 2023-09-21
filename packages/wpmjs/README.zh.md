## wpmjs（web package manager）

基于npm和module-federation的版本化远程模块管理器

## 特性
* 多模块规范（集成了system、umd、module-federation等模块规范）
* 调试模式/热更新（集成了调试面板与热更新, 可以自动连接本地启动的dev-server）
* 版本化管理（可以使用私有或公共npm作为远程模块存储源, 也可以自定义url拼接规则自行存储远程模块）
* 远程锁（支持动态配置远程模块的版本）
* 性能优化（插件自动化优化多个远程模块及其chunk的加载链路, 避免多次加载的等待）



## 贡献
1. 单测（wpmjs sdk）
2. 调试面板（从wpmjs sdk种拆出, 代码规范化, klein组件库替换为其他组件库）
3. 本地端口池插件（鹏的插件, 需要与wpm-plugin和调试面板集成）
4. vite插件、rspack插件（使用@module-federation/vite实现; 持续关注rspack最新mf动态）
5. demo（各种demo仓库的建设）
6. 文档（概念、教程、相关规范、性能优化原理与优势）
7. 可以给webpack官方贡献性能优化的代码（详见chunkMap部分。https://github.com/module-federation/universe/discussions/1170）





## api与插件设计（草稿版）


wpmjs.setConfig({
  baseUrl: "http://cdn.com/npm/",
  map: {
    react: {
      moduleType: "",
      url: "",
      npm: "",
    }
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
  baseUrl: "http://cdn.com/npm/",
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