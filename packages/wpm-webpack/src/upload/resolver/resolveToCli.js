const {getPkgName} = require('../../dev-server/utils')
const upload = require('wpm-publish-cli/lib/upload')

async function resolveToCli(compiler) {
  return new Promise(async (resolve, reject) => {
    try {
      let options = compiler.options
      const config = {
        name: getPkgName(),
        directory: options.output.path,
        moduleType: "mf"
      }
      await upload(config)
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

module.exports = resolveToCli
