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

async function nodeLoadRemote(url, name) {
  if(!globalThis.__remote_scope__) {
    // create a global scope for container, similar to how remotes are set on window in the browser
    globalThis.__remote_scope__ = {
      _config: {},
    }
  }

  if (typeof globalThis.__remote_scope__[name] !== 'undefined') return globalThis.__remote_scope__[name]
  globalThis.__remote_scope__._config[name] = url;

  const vm = require('vm');
  return (globalThis.fetch || require("node-fetch").default)(url).then(function (res) {
    return res.text();
  }).then(function (scriptContent) {
    try {
      const m = require('module'); 		
      const remoteCapsule = vm.runInThisContext(m.wrap(scriptContent), 'node-federation-loader-' + name + '.vm')
      const exp = {};
      let remote = {exports:{}};
      remoteCapsule(exp,typeof __non_webpack_require__ != "undefined" ? __non_webpack_require__ : require,remote,'node-federation-loader-' + name + '.vm',process.cwd());
      remote = remote.exports || remote;
      globalThis.__remote_scope__[name] = remote[name] || remote;
      globalThis.__remote_scope__._config[name] = url;
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