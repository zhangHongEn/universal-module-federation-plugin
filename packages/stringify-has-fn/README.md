## stringify-has-fn

JSON.stringify has function

``` js
const stringifyHasFn = require("stringify-has-fn")

var resStr = stringifyHasFn({
  array: [
    {
      async a (param1) {
        console.log(await param1)
      },
      b: function (param1) {
        return param1
      },
      c: async (param1, param2) => {
        console.log(param1, param2)
      }
    }
  ]
})

eval(`console.log(${resStr})`)
```