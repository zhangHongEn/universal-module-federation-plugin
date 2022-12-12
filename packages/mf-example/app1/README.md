## mf-app-01

Here is an online module-federation example

see: [umf dynamic remotes](https://github.com/zhangHongEn/universal-module-federation-plugin/tree/main/packages/universal-module-federation-plugin#dynamic-remotes)

``` js
// webpack.config.js
new ModuleFederation({
  remotes: {
    "mf-app-01": "mfapp01@https://cdn.jsdelivr.net/npm/mf-app-01/dist/remoteEntry.js"
  }
})
```
``` js
// webpack.config.js
import App1 from "mf-app-01/App"

<App1 />
```