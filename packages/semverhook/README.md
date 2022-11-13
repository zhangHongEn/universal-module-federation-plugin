## semverhook

1.5kb minimalist hook sdk

### API

* semverhook = require("semverhook")()
* import("id") : any | Promise<any>
* resolve("id") : string
* on("resolveRequest" || "resolvePath" || "import", function)
* off("resolveRequest" || "resolvePath" || "import", function)
* get("id")
* getSync("id")

#### 例子

``` js
const semverhook = require("semverhook")()

semverhook.on("resolveRequest", function (request) {
    if (Math.random() > .5) {
      return {
        ...request,
        name: "randomName",
        query: "50%"
      }
    }
})

semverhook.on("resolvePath", function ({name, version, entry, query}) {
  console.log(this === semverhook) // true
  console.log(name) // "@scope/name"
  console.log(version) // "^1.0.3"
  console.log(entry) // "entry"
  console.log(query) // "query=1"
  
  function join(start, str) {
    return (str && `${start}${str}`) || ""
  }
  return `https://unpkg.com/${name}${join("@", version)}${join("/", entry)}${join("?", query)}`
})

semverhook.on("import", function (url) {
  console.log(this === semverhook) // true
  return systemjs.import(url)
})

semverhook.resolve("@scope/name@^1.0.3/entry?query=1") // https://unpkg.com/@scope/name@^1.0.3/entry?query=1
```