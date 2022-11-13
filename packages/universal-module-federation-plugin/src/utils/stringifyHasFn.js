module.exports = function stringifyHasFn (obj) {
  return JSON.parse(JSON.stringify({
    ...obj,
    toJSON () {
        const funJSON = []
        let hasFunction = false
        let hasOther = false
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] !== "function") {
                hasOther = true
                return
            }
            hasFunction = true

            const [args, body] = obj[key].toString().match(/\(([.\s\S]*?\))|(\{[.\s\S]*)\}/g)
           funJSON.push(`"${key}": function ${args} ${body}`)
        })
        return JSON.stringify(obj).replace(/\}$/, `${hasFunction && hasOther ? "," : ""}${funJSON.join(",")}}`)
    }
  }))
}