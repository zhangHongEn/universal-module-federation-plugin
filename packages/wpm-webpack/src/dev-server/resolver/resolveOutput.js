const {isDevelopment, isMultiEntry, isWebpack5, getPkgName} = require('../utils/index')
const log = require('../utils/log')
const chalk = require('chalk')

function resolveOutput(compiler) {
  let options = compiler.options
  if (isWebpack5()) {
    options.output.chunkLoadingGlobal = `_WJSONP_${getPkgName()}`;
  } else {
    options.output.jsonpFunction = `_WJSONP_${getPkgName()}`;
  }
  if (isDevelopment()) {
    if (isMultiEntry()) {
      log.info('多入口项目...')
      options.output.filename = "[name]/index.js"
      options.output.chunkFilename = '[name]-[chunkhash:8].js'
    } else {
      log.info('单入口项目...')
      options.output.filename = "index.js"
      options.output.chunkFilename = '[name]-[chunkhash:8].js'
    }
  } else {
    //动态publicPath注入，依赖配置里面有这个key或者不支持auto
    if (options.output.publicPath == null || options.output.publicPath === 'auto') {
      options.output.publicPath = ''
    }
    if (isMultiEntry()) {
      log.info('多入口项目...')
      options.output.filename = "[name]/index.js"
      options.output.chunkFilename = '[name]-[chunkhash:8].js'
    } else {
      log.info('单入口项目...')
      options.output.filename = "index.js"
      options.output.chunkFilename = 'chunks/[name]-[chunkhash:8].js'
    }
  }
  if (isWebpack5()){
    if ((options.output.library || {}).type !== "umd") {
      options.output.library = {
        type: 'system',
        auxiliaryComment: undefined,
        export: undefined,
        name: undefined,
        umdNamedDefine: undefined
      }
      options.output.enabledLibraryTypes = ['system'];
      log.info(chalk.bgBlue.white('该包output type已被插件修改为system...'))
    }
  }else{
    if (options.output.libraryTarget !== "umd") {
      options.output.libraryTarget = 'system'
      log.info(chalk.bgBlue.white('该包output type已被插件修改为system...'))
    }
  }
}


module.exports = resolveOutput
