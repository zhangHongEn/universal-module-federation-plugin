const fs = require('fs-extra')
const path = require("path");
const log = require('../utils/log')
const {setPkgName} = require('../utils/index')
const {getWpmInHomeDirPath} = require("../utils/index");

let packageName = null

function resolvePlugin(options = {}) {
  //先把脚本依赖的本地目录生成下
  getWpmInHomeDirPath()
  if (options.packageName){
    packageName = options.packageName
  }else{
    const jsonPath = path.resolve(process.cwd(),'package.json')
    if (fs.pathExistsSync(jsonPath)){
      packageName = require(jsonPath).name
    }
  }
  if (packageName == null){
    throw '未检测到可用的WPM包名，请在WpmWebpackPlugin插件设置包名参数，字段为packageName'
  }else{
    setPkgName(packageName)
    log.info(`检测到wpm包名为：${packageName}`)
    log.info("请确保WpmWebpackPlugin配置packageName，或者package.json中name和线上包名一致，方便开启本地调试功能")
  }
}


module.exports = resolvePlugin
