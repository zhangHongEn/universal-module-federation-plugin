declare module "module-federation-runtime" {
  function ModuleFactory(): any

  interface RegisteredShare {
    fromType?: string;
    from?: string;
    loaded?: boolean | number;
    get: function(): ModuleFactory;
    version: string;
    shareScope?: string;
  }

  interface ShareScope {
    [name: string]: {
      [version: string]: RegisteredShare
    }
  }

  interface ShareScopes {
    [key: string]: ShareScope
  }

  interface ModuleFederationContainer {
    init(shareScope: ShareScope): any,
    get(): Promise<ModuleFactory>
  }

  export const remotes: {
    [global: string]: {
      url: string;
      shareScope?: string;
      container: ModuleFederationContainer;
      containerPromise: Promise<ModuleFederationContainer>;
    };
  };
  export const shareScopes: {
    [key: string]: ShareScope;
  };
  export function initShared(shareScopeKey: string, shareScopes?: ShareScopes): void;
  export function registerShared(shared: {
    [name: string]: {
      get: function(): ModuleFactory;
      version: string;
      loaded?: boolean;
      from?: string;
      shareScope?: string;
    };
  }, shareScopes?: ShareScopes): void;
  export function findShared(shareConfig: {
    name: string;
    strictVersion?: boolean;
    singleton?: boolean;
    shareScope?: string;
    requiredVersion?: string;
  }, shareScopes?: ShareScopes): RegisteredShare;
  export function registerRemotes(remotes?: {
    [global: string]: {
      url: string;
      shareScope?: string;
    };
  }, customLoadScript?: function():Promise<any>, shareScopes?: ShareScopes): Promise;
  export function findRemote(global: string): ModuleFederationContainer;
  export function findModule(global: string, path: string): ModuleFactory;
}