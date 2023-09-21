

/**
 * 返回请求url
 * @param {*} param0 
 * @returns 
 */
export function resolveUrl(type, requestObj, loaderMap) {
  return loaderMap[type].resolveUrl(requestObj)
}

/**
 * 解析入口
 */
export function resolveEntry(type, container, entry, loaderMap) {
  return loaderMap[type].resolveEntry(container, entry)
}

/**
 * 返回包模块（未解析入口）
 * @returns 
 */
export function resolveContainer(type, url, options, loaderMap) {
  return loaderMap[type].resolveContainer(url, options)
}

export function formatContainer(container, type, loaderMap) {
  container.$getEntry = async function(entry) {
    return resolveEntry(type, await container, entry, loaderMap)
  }
  
  return Promise.resolve(container).then(res => {
    try {
      res.$getEntry = async function(entry) {
        return resolveEntry(type, await container, entry, loaderMap)
      }
    } catch (e) {
      // 预防严格模式res是基础数据类型时无法赋值报错
    }
  })
}

/**
 * 
 * @param {*} obj {moduleType, resolveUrl, resolveContainer, resolveEntry}
 * @returns 
 */
export function registerLoader(obj, loaderMap) {
  loaderMap[obj.moduleType] = {
    ...(loaderMap[obj.moduleType] || {}),
    ...obj
  }
}