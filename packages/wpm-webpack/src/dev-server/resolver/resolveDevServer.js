const findFreePort = require('find-port-free-sync');
const {isDevelopment,setDevServerUrl} = require("../utils");
const internalIp = require('internal-ip');
const {isWebpack5} = require("../utils");
const port = findFreePort({start: 4000})
// 只有设置一次devServer
let isFirstSet = true

function resolveDevServer(devServer) {
  isFirstSet = false
  const ip = internalIp.v4.sync()
  if (!devServer) {
    devServer = {
      port,
    };
  } else {
    //如果没有port，插件帮忙生成一个
    if (!devServer.port) {
      devServer.port = port
    }
  }
  //TODO:解决跨域
  devServer.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
  }
  devServer.hot = true;
  devServer.historyApiFallback = true;
  devServer.compress = true;
  devServer.allowedHosts= 'all';
  devServer.client = {
    webSocketURL: `ws://localhost:${devServer.port}/ws`,
    progress: true,
    overlay:false,
  }
  setDevServerUrl(`http://localhost:${devServer.port}`)
  return devServer
}


module.exports = function (compiler) {
  let options = compiler.options
  const isDev = isDevelopment()
  if (!isDev) {
    // log.warning(`webpack目前环境为生产环境`)
    return
  } else {
    // log.info(`webpack目前环境为开发环境`)
  }
  if (isFirstSet) {
    compiler.options.devServer = resolveDevServer(options.devServer)
  }
}

module.exports.resolveDevServer = resolveDevServer