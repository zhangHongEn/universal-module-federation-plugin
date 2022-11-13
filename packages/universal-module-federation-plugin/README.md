``` js
保持MF原本API, 支持集成各种模块规范
new ModuleFederation({
   remotes: {
     app1: "app1@http://",
     app2: "app2@http://",
     app3: "app3@http://"
   }
}),

new UniversalModuleFederationPlugin.UMD({
   includeRemotes: /./,
   excludeRemotes: null,
   resolveUmdEntry (res, ) {
    require("fsfs")
   },
   depRefShares: {
    react: {
      singleton: true
    }
   },
   depRefRemotes: ["app2"]
})
```