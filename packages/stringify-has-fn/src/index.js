function stringifyHasFn (obj) {
  var fns = []
  function converter(key, val) {
    if (typeof val === 'function') {
      var seat = `// # ---json-fn---start---${key}--${fns.length - 1}// # ---json-fn---end---`
      fns.push([seat, val])
      return seat
    }
    return val
  }
  var jsonStr = JSON.stringify(obj, converter)
  fns.forEach((fnInfo, index) => {
    var seat = fnInfo[0]
    var fnStr = fnInfo[1].toString()
    var isAsyncFn = fnStr.substring(0, fnStr.indexOf("(")).indexOf("async ") > -1
    var argsAndBody = fnStr.match(/\([\s\S]*\}/)[0]
    var isArrorFun = /^\([\s\S]*\)[\s]*=>[\s]*\{/.test(argsAndBody)
    var fnStatement = isArrorFun ? argsAndBody : `function ${argsAndBody}`
    if (isAsyncFn) fnStatement = `async ${fnStatement}`
    
    jsonStr = jsonStr.replace(`"${seat}"`, fnStatement)
  })
  return jsonStr
}

module.exports = module.exports.default = stringifyHasFn