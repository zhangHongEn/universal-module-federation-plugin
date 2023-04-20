declare module "package-request-parse" {
  /**
   * 遵循npm包名 + 版本号规则来解析请求字符串
   * @param {*} request `@[scope]/[name]@[version]/[entry]?[query]`
   * @returns {name, version, entry, query}
   */
  export default function parseRequest(request): {
    name: string,
    version: string,
    entry: string,
    query: string
  };
}