const {getPkgName} = require('../utils')
const upload = require('wpm-publish-cli/lib/upload')

async function resolveToCli(compiler) {
  return new Promise(async (resolve, reject) => {
    try {
      let options = compiler.options
      const config = {
        name: getPkgName(),
        directory: options.output.path,
      }
      await upload(config)
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = resolveToCli
