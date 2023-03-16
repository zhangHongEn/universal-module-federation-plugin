
module.exports = class SingleReactRefreshPlugin {
  constructor() {
    this.wrapReactRefreshPath = require.resolve("./wrapReactRefreshRuntime.js")
  }
  apply(compiler) {
    this.interceptImport(compiler)
  }

  /**
    * 拦截import
    * @param {*} resolver 
    */
  interceptImport(compiler) {
    compiler.options.resolve = compiler.options.resolve || {}
    compiler.options.resolve.alias = compiler.options.resolve.alias || {}
    // hooks.resolve需要配合alias使原请求失效才能进行拦截
    compiler.options.resolve.alias["react-refresh/runtime"] = "./$interceptReactRefresh"

    compiler.resolverFactory.hooks.resolver
      .for('normal')
      .tap('name', (resolver) => {
        resolver.hooks.resolve.tap('MyPlugin', (request) => {
          const requestStr = request.request || ""
          if (requestStr.indexOf("react-refresh/runtime") > -1) {
            if (requestStr.indexOf("fromWrap=1") > -1) {
              // 来自wrap.js, 重定向到真实的runtime
              return {
                ...request,
                request: "",
                path: require.resolve("react-refresh/runtime"),
                query: ""
              }
            }
            // 将runtime拦截至wrap.js
            return {
              ...request,
              request: "",
              path: this.wrapReactRefreshPath,
              query: ""
            }
          }
        });
      });
   }
}