module.exports = function (interceptDeps, cb) {
  if (!window.System) {
    require("systemjs/dist/s")
    require("systemjs/dist/extras/amd")
  }

  const isInterceptAll = interceptDeps == null

  const depInterceptUrlMap = {
    // react: `https://module-federation.virtual.com/$intercept/react`,
  }
  const interceptUrlDepMap = {
    // "https://module-federation.virtual.com/$intercept/react": "react",
  }
  if (interceptDeps) {
    interceptDeps.forEach(dep => {
      depInterceptUrlMap[dep] = `https://module-federation.virtual.com/$intercept/${dep}`
      interceptUrlDepMap[`https://module-federation.virtual.com/$intercept/${dep}`] = dep
    })
  }

  const eventBus = System.__umfjs__interceptSystemDep || require("semverhook")()
  eventBus.on("resolveDep", function(dep) {
    if (isInterceptAll) {
      return `https://module-federation.virtual.com/$intercept/${dep}`
    }
    return depInterceptUrlMap[dep]
  })
  eventBus.on("interceptDep", function(url) {
    if (isInterceptAll) {
      return url.replace("https://module-federation.virtual.com/$intercept/", "")
    }
    return interceptUrlDepMap[url]
  })
  eventBus.on("importDep", function(dep) {
    if (isInterceptAll || interceptDeps.indexOf(dep) > -1) {
      return cb(dep)
    }
  })

  if (System.__umfjs__interceptSystemDep) {
    return
  }
  System.__umfjs__interceptSystemDep = eventBus

  // 这两处systemjs hook可以使用window.System.set替代, 但是set在s.js没有, 而system.js依赖的处理顺序有bug
  const existingHookResolve = System.constructor.prototype.resolve;
  System.constructor.prototype.resolve = function (url, parentUrl) {
    const interceptUrl = eventBus.emit("resolveDep", [url])
    return interceptUrl || existingHookResolve.call(this, url, parentUrl);
  };

  const existingHookInstantiate = System.constructor.prototype.instantiate;
  System.constructor.prototype.instantiate = function (url) {
    const dep = eventBus.emit("interceptDep", [url])
    if (dep) {
      return [[], function(_export, _context) {
        return {
          async execute() {
            const res = await eventBus.emit("importDep", [dep])
            _export(res)
          },
          setters: []
        }
      }]
    }
    return existingHookInstantiate.call(this, url);
  };
}