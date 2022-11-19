const {Template} = require("webpack")
module.exports = function stringifyHasFn (obj) {
  const fns = []
  function converter(key, val) {
    if (typeof val === 'function' || val && val.constructor === RegExp) {
      const seat = `// # ---json-fn---start---${key}--${fns.length - 1}// # ---json-fn---end---`
      fns.push([seat, val])
      return seat
    }
    return val
  }
  let jsonStr = JSON.stringify(obj, converter)
  fns.forEach((fnInfo, index) => {
    const seat = fnInfo[0]
    const fnStr = fnInfo[1].toString()
    const isAsyncFn = fnStr.substring(0, fnStr.indexOf("(")).indexOf("async ") > -1
    const argsAndBody = fnStr.match(/\([\s\S]*\}/)[0]
    const isArrorFun = /^\([\s\S]*\)[\s]*=>[\s]*\{/.test(argsAndBody)
    let fnStatement = isArrorFun ? argsAndBody : `function ${argsAndBody}`
    if (isAsyncFn) fnStatement = `async ${fnStatement}`
    
    jsonStr = jsonStr.replace(`"${seat}"`, fnStatement)
  })
  return jsonStr
}