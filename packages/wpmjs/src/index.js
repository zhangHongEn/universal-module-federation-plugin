const global = require("global")
if (!global.wpmjs) {
  const Wpmjs = require("./wpmjs")
  global.wpmjs = global.wpmjs || new Wpmjs({
    name: "globalWpmjs"
  })
}
global.wpmjsDebug = global.wpmjsDebug || new global.wpmjs.constructor({
  name: "globalWpmjsDebug"
})

module.exports = global.wpmjs