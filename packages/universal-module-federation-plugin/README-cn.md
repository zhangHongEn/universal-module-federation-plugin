# universal-module-federation-plugin

[![npm](https://img.shields.io/npm/v/universal-module-federation-plugin.svg)](https://www.npmjs.com/package/universal-module-federation-plugin)

支持 [webpack-4](https://github.com/module-federation/webpack-4)、5

保持模块联合的原始API，支持各种模块规范的集成

允许您自己控制每个依赖项的所有步骤

## 在线尝试

[mf + umd](https://stackblitz.com/github/wpmjs/examples/tree/main/umf-demo?file=app2%2Fwebpack.config.js)

## UmdPlugin示例

允许模块联合使用umd模块，可以从shareScopes或remotes获取umd依赖项

``` js
// webpack.config.js
const {UmdPlugin} = require("universal-module-federation-plugin")

module.exports = {
    plugins: [
        new ModuleFederationPlugin({
          name: 'app3',
          filename: 'remoteEntry.js',
          remotes: {
            app2: "app2@http://localhost:9002/remoteEntry.js",
            "react-router": "app4reactRouter@https://unpkg.com/react-router@6.4.3/dist/umd/react-router.production.min.js",
            "@remix-run/router": "app5remixRouter@https://unpkg.com/@remix-run/router@1.0.3/dist/router.umd.min.js"
          },
          exposes: {
            './App': './src/App',
          },
          shared: { react: { singleton: true }, 'react-dom': { singleton: true } },
        }),
        new UmdPlugin({
          // 匹配的remote以umd模式加载
          includeRemotes: [/react-router/, "@remix-run/router"],
          dependencies: {
            automatic: ["shareScopes", "remotes"],
          }
        }),
        new UmdPlugin({
          // ...
          // 可多次使用
        })   
    ]
}
```

## UmdPlugin API

| options                       | desc                                       | default                           | examles                                           |
|-------------------------------|--------------------------------------------|-----------------------------------|:--------------------------------------------------|
| includeRemotes                | 匹配 umd remote                            | []                                | [/umd-app/, "app3"]                               |
| excludeRemotes                | 排除 umd remotes                           | []                                | ["app2"]                                          |
| dependencies.automatic        | 自动匹配remotes和shared中同名的依赖项      | ["shareScopes", "remotes"]        |                                                   |
| dependencies.referenceShares  | 配置从 __*shared*__ 中寻找umd的依赖                | {}                                | {react: {singleton: true, requiredVersion: "17"}} |
| dependencies.referenceRemotes | 配置从remotes中寻找umd的依赖               | {}                                | {react: "app5"}                                   |
| runtimeUmdExposes             | 如果umd包有多个入口，可以用这个函数解析入口 | ({$umdValue}) => return $umdValue |                                                   |
| runtimeInject                 | 同 __*UniversalModuleFederationPlugin*__   |                                   |                                                   |

#### runtimeUmdExposes
``` js
// $umdValue: umd模块的返回值
// $moduleName: "./App" <=== import "umdRemote/App"
runtimeUmdExposes({ $umdValue, $moduleName }) {
    $moduleName = $moduleName.replace(/^\.\/?/, "")
    if ($moduleName) {
      return $umdValue[$moduleName]
    }
    return $umdValue
}
```

## UniversalModuleFederationPlugin 示例

如果你有自己的模块规范，你可以使用 UniversalModuleFederationPlugin 来集成它。 umdPlugin就是使用这个插件实现的，可以参考[UmdPlugin源码](./src/UmdPlugin.js)

UniversalModuleFederationPlugin 暴露一些钩子来自定义控制远程的加载行为

``` js
// webpack.config.js
const {UniversalModuleFederationPlugin} = require("universal-module-federation-plugin")

plugins: [
    new UniversalModuleFederationPlugin({
      includeRemotes: [/.*/],
      excludeRemotes: [],
      runtimeInject: {
        injectVars: {},
        initial: () => {},
        beforeImport(url) {},
        import(url) {}
      }
    })
]
```


``` js
// webpack.config.js
plugins: [
    new UniversalModuleFederationPlugin({
      includeRemotes: [/.*/],
      excludeRemotes: [],
      runtimeInject: {
        // 可以在以下任何runtime hooks中访问"__umf__.$injectVars.testInjectVar"
        injectVars: {
          testInjectVar: 111,
        },
        // 任意runtime hooks都会注入"__umf__"这个变量
        initial: async () => {
          const {$getShare, $getRemote, $containerRemoteKeyMap, $injectVars, $context} = __umf__
          const testInjectVar = $injectVars
          console.log("__umf__", __umf__, testInjectVar)
          // $context is an empty object by default, used to pass values between multiple hooks
          $context.testA = "testA"
          await new Promise(resolve => {
            setTimeout(function () {
              resolve()
            }, 3000)
          })
        },
        import(url) {
          console.log("__umf__", __umf__)
          return {
            init(){},
            async get(moduleName = "") {
              return function() {
                return {
                  testModule: 123
                }
              }
            }
          }
        }
      }
    })
]
```

## UniversalModuleFederationPlugin API

| options                                      | desc                                                                                       | default      | examles             |
|----------------------------------------------|--------------------------------------------------------------------------------------------|--------------|:--------------------|
| includeRemotes                               | 匹配 umf remotes                                                                          | []           | [/umf-app/, "app3"] |
| excludeRemotes                               | 排除 umf remotes                                                                        | []           | ["app2"]            |
| runtimeInject.injectVars                     | 为runtime hooks注入变量，任何运行时挂钩都可以使用"\_\_umf\_\_.$injectVars"访问 | {}           | {test: 123}         |
| runtimeInject.initial():promise                      | 初始化阶段的runtime hook                                                                      | function(){} |                     |
| runtimeInject.beforeImport(url):promise<url> | 准备引入remote时触发 | function(){} |                     |
| runtimeInject.import(url):promise<module>    | remote的引入钩子, 需要返回一个 container{init, get}                        | function(){} |                     

#### \_\_umf\_\_

任何运行时挂钩都会注入"\_\_umf\_\_"变量

| property                                                             | desc                                                                                                                 | examles                                    |
|----------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| $getRemote("request"):promise<module>                                | 用于获取远程模块, 与from处语法一致: import xxx from "xxxx/xxx"                                                         | $getRemote("app2/App")                     |
| $getShare(pkgname: string, {singleton, requiredVersion, ......}):promise<module> | 用于获取share, 第二个参数与shared.xxx配置一致                                                         | $getShare("react", {singleton: true})      |
| $containerRemoteKeyMap: object                                       | 如果配置了 remotes: {"@app2/xx": "app3@http://xxx"}  | 则可以这么获取remotes的映射: $containerRemoteKeyMap.app3 --> "@app2/xx" |
| $injectVars: object                                                  | 插件配置的注入运行时的变量                                                                                        |                                            |
| $context: object                                                     | $context 默认为空对象，用于多个hook之间传递值                                   | $context.xxx = xxx                         |
| -                                                                    | -                                                                                                                    | -                                          |

