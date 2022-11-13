
module.exports = function lod (source, map, meta) {
  if (module.exports.entryResources.has(this.resourcePath + this.resourceQuery)) {
    const callback = this.async();
    waitInjects
      .then(injectCode => {
        callback && callback(null, `
        ${injectCode}
        \r\n;
        ${source}
        `);
      })
      .catch(err => {
        callback && callback(err, undefined);
      });
    return undefined;
  }
  this.callback(null, source, map, meta)
}
module.exports.entryResources = new Set()


module.exports.injectArray = []


let waitInjects = Promise.resolve()
let runInjects = []
const oriPush = module.exports.injectArray.push
module.exports.injectArray.push = function () {
  try {
    return oriPush.apply(this, arguments)
  } catch (e) {
    throw new Error(e)
  } finally {
    runInjects.push.apply(runInjects, Array.prototype.map.call(arguments, (fn) => Promise.resolve(fn())))
    waitInjects = Promise.all(runInjects)
      .then(injectCodeArray => {
        return injectCodeArray.join(";\r\n")
      })
  }
}