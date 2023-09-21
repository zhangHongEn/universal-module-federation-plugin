const chalk = require('chalk')

const error = chalk.bold.red;
const warning = chalk.hex('#FFA500');
const info = chalk.bold.greenBright;
const alert = chalk.white.bold.bgBlueBright;

module.exports = {
  error: function (msg) {
    console.log(error(`❎ [WpmWebpackPlugin] ${msg}`))
  },
  warning: function (msg) {
    console.log(warning(`⚠️ [WpmWebpackPlugin] ${msg}`))
  },
  info: function (msg) {
    console.log(info(`💬 [WpmWebpackPlugin] ${msg}`))
  },
  alert: function (msg) {
    console.log(alert(`💬 [WpmWebpackPlugin] ${msg}`))
  },
}
