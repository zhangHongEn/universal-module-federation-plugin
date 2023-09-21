/**
 * 实现css隔离的自定义postcss插件
 */
const postcss = require("postcss")

module.exports = postcss.plugin("cssScope", (opts) => {
  opts = opts || {}
  // var scopeReplaceName = opts.scopeName
  const scopeInsertName = opts.scopeName
  // Work with options here
  return function (root, result) {
    // Transform CSS AST here
    root.walkRules((rule) => {
      if (rule.parent.type === "root" || (rule.parent.type === "atrule" && ["media", "document", "supports"].indexOf(rule.parent.name) > -1)) {
        const selectors = rule.selector.split(",")
        selectors.forEach((name, i) => {
          // 过滤
          if (name.trim().match(/^\s*(html|body)([ .]|$)/) || name.match(/^(\.el-message|\.el-popup-parent)/)) return

          if (name.trim().match(/^(\.sparrow|\[data-v-[\da-zA-Z]+])([ .]|$)/)) {
            selectors[i] = scopeInsertName + name.trimLeft()
            return
          }
          selectors[i] = `${scopeInsertName} ${name.trimLeft()}`
        })
        rule.selector = selectors.join(",")
      }
    })
  }
})
