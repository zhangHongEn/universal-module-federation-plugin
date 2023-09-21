const {isDevelopment, getPkgName, getDevServerUrl, findExistServerProcess, isWebpack5} = require("../utils");
const log = require("../utils/log");
const {getValueInRootConfigs, isMultiEntry} = require("../utils/index");
const axios = require('axios')


function resolveLocalLibMap(stats) {
  return new Promise(async (resolve, reject) => {
    try {
      if (isDevelopment() === false) {
        resolve()
      } else {
        const list = []
        for (const chunk of stats.compilation.chunks) {
          const files = [...chunk.files]
          if (isWebpack5()){ //webpack5的取值方法
            // 如果有name，则代表对应的有entry，并且files里面的第一条，代表是访问的入口
            //多入口的话就是只返回最外层的url即可
            const chunkEntryOptions = chunk.getEntryOptions()
            if (chunkEntryOptions && chunkEntryOptions.name) {
              const name = getPkgName()
              const url = getDevServerUrl()
              // const url = isMultiEntry() ? getDevServerUrl() : `${getDevServerUrl()}/${files[0]}`
              list.push({
                name,
                url
              })
            }
          }else{ //webpack4
            if (chunk.hasEntryModule() && chunk.entryModule){
              if (chunk.entryModule.name) {
                const name = getPkgName()
                const url = getDevServerUrl()
                // const url = isMultiEntry() ? getDevServerUrl() : `${getDevServerUrl()}/${files[0]}`
                list.push({
                  name,
                  url: url
                })
              }
            }
          }
        }
        const map = {name: getPkgName(), list}
        await uploadToLibServers(map)
        resolve()
      }
    } catch (e) {
      console.log(e)
    }
  })
}

//将本地的包，同步到服务器上
async function uploadToLibServers(infos) {
  const port = getValueInRootConfigs('ChildProcessServerPort')
  try {
    await axios.post(`http://localhost:${port}/update`, infos)
    log.info(`${getPkgName()}的包信息已更新成功`)
  } catch (e) {
    throw e
  }
}


module.exports = {
  resolveLocalLibMap,
}
