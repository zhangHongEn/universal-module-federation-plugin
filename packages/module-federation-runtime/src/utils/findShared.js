import {rangesMaxSatisfying} from "./semver"

export function findShared(shareConfig = {}, shareScopes) {
  if (!shareScopes) throw new Error("shareScopes is required")
  if (!shareConfig.name) throw new Error("name is required")
  const pkg = shareConfig.name
  const {strictVersion, singleton, shareScope = "default", requiredVersion = "*"} = shareConfig
  if (!shareScopes[shareScope] || !shareScopes[shareScope][pkg]) {
    return null
  }
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
  return shareScopes[shareScope][pkg][useShareVersion]
}