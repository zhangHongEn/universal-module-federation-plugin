
function CacheUtil() {
  this.cacheUtilMap = {}
  this.cacheUtilMapSync = {}
}
const proto = CacheUtil.prototype
proto.setCache = /**
* @param {*} key 
* @param {*} getCacheObject 
* @returns 
*/
proto.setCache = function(key, getCacheObject) {
 const cacheUtilMap = this.cacheUtilMap
 const res = cacheUtilMap[key] = cacheUtilMap[key] || getCacheObject()
 Promise.resolve(res).then(val => {
   this.cacheUtilMapSync[key] = val
 })
 return res
} 
proto.getCache = function(key) {
  return this.cacheUtilMap[key]
}

proto.getCacheSync = function(key) {
  return this.cacheUtilMapSync[key]
}

module.exports = CacheUtil