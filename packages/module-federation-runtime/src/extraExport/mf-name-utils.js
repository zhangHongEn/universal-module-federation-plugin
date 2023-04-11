/**
 * 转意符释意: 
 *  以 __${映射}__ 来做转换, _和$都是npm所不允许的包名符号, 但可以作为变量名
 *  @ => 1
 *  / => 2
 *  - => 3
 *  . => 4
 */

/**
 * 将一个包名转换成module-federation可以使用的global变量名
 * @param {*} name "@scope/xx-xx.xx" => "__$1__scope__$2__xx__$3__xx$__4__xx"
 */
module.exports.nameToGlobal = function(name) {
  if (typeof name !== "string") throw new Error("需传入字符串包名")
  return name
    .replace(/\@/g, "__$1__")
    .replace(/\//g, "__$2__")
    .replace(/\-/g, "__$3__")
    .replace(/\./g, "__$4__")
}

/**
 * 将一个module-federation使用的global变量名还原成包名
 * @param {*} global "__$1__scope__$2__xx__$3__xx$__4__xx" => "@scope/xx-xx.xx"
 */
module.exports.globalToName = function(global) {
  if (typeof global !== "string") throw new Error("需传入字符串全局变量名")
  return global
    .replace(/\_\_\$1\_\_/g, "@")
    .replace(/\_\_\$2\_\_/g, "/")
    .replace(/\_\_\$3\_\_/g, "-")
    .replace(/\_\_\$4\_\_/g, ".")
}