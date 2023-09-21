function asyncVue(asyncVue) {
  return async function (resolve) {
    const vueRes = await asyncVue
    if (typeof vueRes === "function") {
      resolve(await vueRes())
    } else {
      resolve(vueRes)
    }
  }
}

module.exports = asyncVue;
