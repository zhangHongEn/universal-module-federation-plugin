const {fork} = require('child_process');
const path = require("path");
const log = require('../utils/log')
const find = require("find-process");
const {isDevelopment, findExistServerProcess, WPM_UNIQUE_CHILD_PROCESS_ID, getPkgName} = require("../utils");
const {getValueInRootConfigs} = require("../utils/index");

module.exports = async function () {
  try {
    if (isDevelopment() === false) { //打包的时候不需要启动

    } else if (await findExistServerProcess() != null) { //本地已经有这个进程了，不用启动了
      const wssPort = getValueInRootConfigs('ChildProcessWebsocketPort')
      const httpPort = getValueInRootConfigs('ChildProcessServerPort')
      console.log(`wpm-plugin: ${wssPort}/${httpPort}`)
      registerCleaner()
    } else {
      registerCleaner()
      const child = fork(path.resolve(__dirname, '../workers/server.js'), [`--key ${WPM_UNIQUE_CHILD_PROCESS_ID}`], {
        detached: true,//准备子进程独立于其父进程运行, 设为false，则父进程结束，子进程也销毁
      })
      child.unref() //解绑子进程，让父进程不用等待子进程
      log.info(`The WPM running child_process_id is ${child.pid}`)
      const list = await find('pid', child.pid)
      list[0].name = WPM_UNIQUE_CHILD_PROCESS_ID
    }
    process.on('beforeExit',()=>{

    })
  } catch (e) {
    console.log(e)
    throw e
  }
}

function registerCleaner(){
  const cleanerProcess = fork(path.resolve(__dirname, '../workers/cleaner.js'), {
    detached: true,//准备子进程独立于其父进程运行, 设为false，则父进程结束，子进程也销毁
  })
  cleanerProcess.unref() //解绑子进程，让父进程不用等待子进程
  process.on('exit',()=>{
    cleanerProcess.send({'type':'close',pkgName:getPkgName()})
  })
}
