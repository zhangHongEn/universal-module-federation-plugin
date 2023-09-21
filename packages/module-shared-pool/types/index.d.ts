declare module "weimob-module-shared" {
  
  export function registerShared(shared: {
    name: string;
    version: string;
    get: function(): Promise<any>
  }): void;
  export function findShared(shareConfig: {
    name: string;
    requiredVersion?: string;
  }): Promise<any>;
}