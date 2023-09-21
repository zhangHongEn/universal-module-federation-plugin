const lodash = require('lodash')
const {Template} = require("webpack")
const {ConcatSource} = require("webpack-sources");
const {isWebpack5, WPM_PLUGIN_NAME} = require("../utils");
const log = require('../utils/log')
const path = require("path");
const SystemContextPlugin = require("system-context-webpack-plugin")


const loaderPath = require.resolve("../loaders/public_path_loader")

function resolvePublicPath(compiler) {
  if (isWebpack5() === false) { //webpack5以下的兼容
    new SystemContextPlugin().apply(compiler)
  }
  let entries = []
  const options = compiler.options
  options.output.publicPath = null //让用户配置的失效，根据动态的publicpath来
  if (isWebpack5()) {
    entries = Object.keys(options.entry).map(key => {
      return options.entry[key].import
    })
    entries = lodash.flattenDeep(entries)
  } else {
    entries = entryToStringArray(options.entry).map(entryPath => path.join(options.context, entryPath))
  }
  // 注册loaders
  let hasPathLoader = false
  for (let rule of options.module.rules) {
    let uses = []
    if (rule.use){
      uses = lodash.isArray(rule.use) ? rule.use : [rule.use]
    }
    uses.forEach(item => {
      if (item.loader === loaderPath) {
        hasPathLoader = true
      }
    })
  }
  if (!hasPathLoader) {
    compiler.options.module.rules = [
      ...options.module.rules,
      {
        test: entries,
        loader: loaderPath
      }
    ]
  }
}

//webpack4转换入口
function entryToStringArray(entry) {
  if (entry instanceof Array) {
    return entry.map(entryItem => entryToStringArray(entryItem))
      .reduce((p, n) => p.concat(n))
  } else if (typeof entry === "object") {
    return Object.keys(entry).map(name => entryToStringArray(entry[name]))
      .reduce((p, n) => p.concat(n))
  } else if (typeof entry === "string") {
    return [entry]
  }
}

module.exports = resolvePublicPath
