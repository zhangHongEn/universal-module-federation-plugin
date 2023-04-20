# package-request-parse

[![npm](https://img.shields.io/npm/v/package-request-parse.svg)](https://www.npmjs.com/package/package-request-parse)

follow the npm package name + version number rule to parse the request string


``` js
function parseRequest(request = "") {
  var {1: name, 5: version = '', 7: entry = "", 9: query = ""} = request.match(/^((@[^/]+?\/)?([^/@?]+))(@([^/?]+?))?(\/([^?]+?))?(\?(.+?))?$/) || []
  if (!request || !name) throw new Error("id error:" + request)
  return {
    entry,
    name,
    version,
    query
  }
}

import parseRequest from "package-request-parse"

parseRequest("@test1/test2@1.0.0/test3?v=2") // { "entry": "test3", "name": "@test1/test2", "version": "1.0.0", "query": "v=2" }
parseRequest("test2?v=2") // { "entry": "", "name": "test2", "version": "", "query": "v=2" }
```