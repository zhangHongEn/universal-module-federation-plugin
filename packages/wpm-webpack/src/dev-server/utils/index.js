const homeOrTemp = require('home-or-tmp')
const fs = require("fs-extra");
const fswin = require('fswin')
const log = require('../utils/log')
const find = require("find-process");
const path = require('path')
const lodash = require('lodash')

const WPM_UNIQUE_CHILD_PROCESS_ID = 'WPM_UNIQUE_CHILD_PROCESS_ID'
const WPM_PLUGIN_NAME = 'wpm-webpack-plugin'

let WPM_PKG_NAME = null
let WPM_DEV_SERVER_URL = null
let IS_MULTIENTRY = null
let IS_WEBPACK5 = null
let IS_DEVELOPMENT = null

function isWebpack5(compiler) {
  if (IS_WEBPACK5 == null && compiler && compiler.webpack) {
    log.info(`compiler.webpack.version->${compiler.webpack.version}`)
    IS_WEBPACK5 = compiler.webpack && compiler.webpack.version >= '5';
  }
  return IS_WEBPACK5 || false
}


//检测是不是开发模式
function isDevelopment(options) {
  if (IS_DEVELOPMENT === null && options){
    if (!options.mode){
      log.error('请指定webpack mode,开发环境为development...')
      process.exit()
    }
    IS_DEVELOPMENT = options.mode === 'development'
  }
  return IS_DEVELOPMENT || false
}

//检测是不是多入口
function isMultiEntry(options) {
  if (isWebpack5()){
    if (IS_MULTIENTRY == null && options) {
      IS_MULTIENTRY = Object.keys(options.entry).length > 0
    }
  }else{ //webpack版本小于5
    if (IS_MULTIENTRY == null && options) {
      if (lodash.isArray(options.entry)){ //数组形式也是单入口
        IS_MULTIENTRY = false
      }else if (lodash.isPlainObject(options.entry) && Object.keys(options.entry).length > 0){
        IS_MULTIENTRY = true
      }
    }
  }
  return IS_MULTIENTRY || false
}

//在电脑的用户目录下，创建一个.wpm隐藏文件夹备用
function getWpmInHomeDirPath() {
  let rootPath = path.resolve(homeOrTemp, '.wpm/')
  fs.ensureDirSync(rootPath)
  if (isWin()) {
    log.info('The platform is windows')
    fswin.setAttributesSync(rootPath, {IS_HIDDEN: true});
  }
  let configFilePath = path.resolve(rootPath, 'configs.json')
  if (fs.pathExistsSync(configFilePath) === false) {
    fs.ensureFileSync(configFilePath)
    fs.writeJsonSync(configFilePath, {})
  }
  return rootPath
}

function getWpmLocalConfigsFilePath() {
  const rootPath = getWpmInHomeDirPath()
  return path.resolve(rootPath, './configs.json')
}

function setValueInRootConfigs(key, value) {
  const configsPath = getWpmLocalConfigsFilePath()
  const configs = require(configsPath)
  configs[key] = value
  fs.writeJsonSync(configsPath, configs)
}


function getValueInRootConfigs(key) {
  const configs = require(getWpmLocalConfigsFilePath())
  return configs[key]
}

//缓存包名
function setPkgName(name) {
  WPM_PKG_NAME = name
}

function getPkgName() {
  return WPM_PKG_NAME
}

//开发环境下目前的url，方便拼接地址给维佳的面板
function setDevServerUrl(url) {
  WPM_DEV_SERVER_URL = url
}

function getDevServerUrl() {
  return WPM_DEV_SERVER_URL
}

//找到目前开启server的进程
async function findExistServerProcess() {
  const list = await find('name', 'node')
  if (list.length > 0) {
    const found = list.find(o => {
      return o.cmd.includes(WPM_UNIQUE_CHILD_PROCESS_ID)
    })
    if (found) {
      log.info('The WPM libs debug child_process is exist...')
      log.info(`The WPM running child_process_id is ${found.pid}`)
      return found
    }
  }
  return null
}

//判断是不是windows
function isWin() {
  return /^win/i.test(process.platform);
}


module.exports = {
  WPM_UNIQUE_CHILD_PROCESS_ID,
  WPM_PLUGIN_NAME,
  isWebpack5,
  setValueInRootConfigs,
  getValueInRootConfigs,
  isDevelopment,
  isMultiEntry,
  getWpmInHomeDirPath,
  setPkgName,
  getPkgName,
  setDevServerUrl,
  getDevServerUrl,
  findExistServerProcess,
}
