const log = require('../utils/log')
const {getValueInRootConfigs} = require("../utils");
const axios = require("axios");

function registerCleaner() {
  log.info('cleaner process is running...')
  process.on('message', async function (m) {
    if (m.type === 'close') {
      await unRegisterLib(m.pkgName)
      process.exit(1)
    }
  });
}

async function unRegisterLib(pkgName) {
  log.info(`监听停止了，注销包信息->${pkgName}...`)
  const port = getValueInRootConfigs('ChildProcessServerPort')
  try {
    await axios.post(`http://localhost:${port}/delete`, {pkgName})
    log.info(`${pkgName}的包信息已注销成功`)
  } catch (e) {
    throw e
  }
}

registerCleaner()

