const {rangesMaxSatisfying} = require("./semver")

module.exports.findShare = function getShare(pkg, shareConfig = {}, shareScopes) {
  // TODO: shareConfig fill default
  if (!shareScopes) throw new Error("shareScopes is required")
  const {strictVersion, singleton, shareScope = "default", requiredVersion = "*"} = shareConfig
  const pkgVersions = shareScopes[shareScope][pkg]
  const loadedShareVersions = Object.keys(pkgVersions).filter(version => !!pkgVersions[version].loaded)
  const rangeMax = rangesMaxSatisfying(Object.keys(pkgVersions), requiredVersion)
  const max = rangesMaxSatisfying(Object.keys(pkgVersions), "*")
  const loadedRangeMax = rangesMaxSatisfying(loadedShareVersions, requiredVersion)
  const loadedMax = rangesMaxSatisfying(loadedShareVersions, "*")
  const useShareVersion = singleton ? 
  loadedRangeMax || loadedMax || rangeMax || max :
    rangeMax || max
  if (strictVersion && !rangesMaxSatisfying([useShareVersion], requiredVersion)) {
    throw new Error(`Unsatisfied version \${useShareVersion} from app1 of shared singleton module react (required ${requiredVersion})
    at getStrictSingletonVersion `)
  }
  return [useShareVersion, shareScopes[shareScope][pkg][useShareVersion]]
}