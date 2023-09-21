

async function testMf() {
  const res = await window.wpmjs.import("mf-app-01/App", {type: "mf"})
  const container = await window.wpmjs.import("mf-app-01", {type: "mf"})
  console.log("mf:", res, await container.$getEntry("App"))
}

async function testJson() {
  const res = await window.wpmjs.import("test-json-package/injector_basename", {type: "json"})
  const container = await window.wpmjs.import("test-json-package", {type: "json"})
  console.log("json:", res, await container.$getEntry("injector_basename"))
}

async function testSystem() {
  const res = await window.wpmjs.import("@core-klein/basic-multiple/SaasEnv", {type: "system"})
  const container = await window.wpmjs.import("@core-klein/basic-multiple", {type: "system"})
  console.log("system:", res, await container.$getEntry("SaasEnv"))
}


;(async function main() {
  await testMf()
  await testJson()
  await testSystem()
})();