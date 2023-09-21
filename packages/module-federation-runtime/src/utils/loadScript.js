import getPromise from "./getPromise";

export default function loadScript(url, name) {
  if (typeof document !== "undefined") {
    const { promise, reject, resolve } = getPromise()
    const element = document.createElement("script")

    element.src = url;
    element.type = "text/javascript"
    element.async = true;

    element.onload = () => {
      resolve()
    };

    element.onerror = (e) => {
      e.target = {
        src: url
      }
      console.error('load script error', e);
      reject(e)
    };
    try {
      return promise
    } finally {
      document.head.appendChild(element);
    }
  } else if (process.env.TARGET === "node") {
    return nodeLoadRemote(url, name)
  }
}

function nodeLoadRemote(url, name) {
  const vm = require('vm');
  return (globalThis.fetch || require("node-fetch").default)(url).then(function (res) {
    return res.text();
  }).then(function (scriptContent) {
    try {
      const m = require('module'); 		
      const remoteCapsule = vm.runInThisContext(m.wrap(scriptContent), 'node-federation-loader-' + name + '.vm')
      const exp = {};
      let remote = {exports:{}};
      remoteCapsule(exp,require,remote,'node-federation-loader-' + name + '.vm',__dirname);
      remote = remote.exports || remote;
      return remote
    } catch (e) {
      console.error('executeLoad hit catch block', e);
      e.target = {src: url};
      throw e;
    }
  }).catch((e) => {
    e.target = {src: url};
    throw e
  });
}