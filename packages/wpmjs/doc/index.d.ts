declare module "global" {
  const _global: any;
  export = _global;
}

// Add declarations for other modules used in the code, such as './moduleResolve', './utils/CacheUtil', './debugMode', etc.
// ...

interface RequestObj {
  name: string;
  version: string;
  filename: string;
  entry: string;
  query: string;
  baseUrl: string;
}

interface PkgConfig {
  packageName?: string;
  packageVersion?: string;
  packageFilename?: string;
  packageQuery?: string;
}

declare function resolveRequest(request: string, config: any, pkgConfig: PkgConfig): RequestObj;

declare function wimportSync(request: string): any;

declare function getPkgConfig(name: string, config: any): PkgConfig;

declare function wimportWrapper(request: string): any;

declare function wimport(request: string): Promise<any>;

declare class CacheUtil {
  // Add type definitions for the CacheUtil class members
  // ...
}

interface WpmjsLoaderMap {
  [moduleType: string]: {
    moduleType: string;
    resolveUrl: Function;
    resolveContainer: Function;
    resolveEntry: Function;
  };
}

interface Container {
  $getEntry(entryPath: string): Promise<any>
}

declare function Wpmjs(options?: { name?: string }): void;

declare class Wpmjs {
  config: any;
  cacheUtil: CacheUtil;
  loaderMap: WpmjsLoaderMap;

  sleep(promise: Promise<any>): Promise<any>;
  setConfig(config: any): any;
  addImportMap(config: any): any;
  registerLoader(obj: any): void;
  getConfig(): any;
  debug: any;
  import(request: string): Promise<Container | any>;
  get(request: string): any;
  setShared: Function;
  getShared: Function;
}

export = Wpmjs;