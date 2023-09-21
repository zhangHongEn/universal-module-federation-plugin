# module-federation-runtime

[![npm](https://img.shields.io/npm/v/single-react-refresh-plugin.svg)](https://www.npmjs.com/package/module-federation-runtime)

this package simulates and exposes the module-federation API, Support browser and node environment

## applicable scene

1. can be used to implement module-federation in different compilation environments
2. can be used to [dynamically load module-federation](https://h3manth.com/posts/dynamic-remotes-webpack-module-federation/) modules
    > Please try to register all remotes in the initialization phase of the entire project as much as possible to achieve the same effect as when compiling
    > Otherwise, it will be difficult for you to maintain your shared: singleton, requiredVersion and other strategies because the shared library will be dynamically added during runtime

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [remotes](#remotes)
  - [shareScopes](#sharescopes)
  - [initSharing](#initsharing)
  - [registerShared](#registershared)
  - [findShared](#findshared)
  - [registerRemotes](#registerremotes)
  - [findRemote](#findremote)
  - [findModule](#findmodule)

## Installation

```sh
npm install module-federation-runtime
```

## Usage example
```js
// browser
import * as runtime from 'module-federation-runtime';
// node
import * as runtime from 'module-federation-runtime/dist/node';
```

```js
import { remotes, shareScopes, initSharing, registerShared, findShared, registerRemotes, findRemote, findModule } from 'module-federation-runtime';

;(async function () {
  await registerRemotes({
    "mfapp01": {
      url: "https://cdn.jsdelivr.net/npm/mf-app-01/dist/remoteEntry.js"
    },
    "mfapp02": {
      url: "https://cdn.jsdelivr.net/npm/mf-app-02@latest/dist/remoteEntry.js"
    }
  })
  registerShared({
    "react-dom1": {
      version: "18.0.0",
      get() {
        return function () {
          return {
            test: 1
          }
        }
      }
    }
  })
  const AppFactory = await findModule("mfapp01", "./App")
  const shareReactDom = findShared({
    name: "react-dom",
    requiredVersion: "18"
  })
  console.log("remotes", remotes)
  console.log("findRemote", findRemote("mfapp01"))
  const App = AppFactory()
  console.log("App", App)
  console.log("shareScopes", shareScopes)
  console.log("shareReactDom from:", shareReactDom.from)
  console.log("shareReactDom value:", (await shareReactDom.get())())
})()
```

## API

### initSharing

wait for all remote modules to be initialized

```js
initSharing(shareScopeKey: string): Promise<1>;

initSharing("default").then(() => {})
```

### registerShared

```js
registerShared(shared: {
  [name: string]: {
    get: function(): ModuleFactory;
    version: string;
    loaded?: boolean;
    from?: string;
    shareScope?: string;
  };
}, shareScopes?: ShareScopes): void;
```

### findShared

```js
findShared(shareConfig: {
  name: string;
  strictVersion?: boolean;
  singleton?: boolean;
  shareScope?: string;
  requiredVersion?: string;
}, shareScopes?: ShareScopes): RegisteredShare;
```

### registerRemotes

```js
registerRemotes(remotes?: {
  [global: string]: {
    url: string;
    shareScope?: string;
  };
}, customLoadScript?: function():Promise<any>, shareScopes?: ShareScopes): Promise;
```

### findRemote

```js
findRemote(global: string): Promise<ModuleFederationContainer>;
```

### findModule

```js
findModule(global: string, path: string): Promise<ModuleFactory>

### remotes

```js
remotes: {
  [global: string]: {
    url: string;
    shareScope?: string;
    container: ModuleFederationContainer;
    containerPromise: Promise<ModuleFederationContainer>;
  };
};
```

### shareScopes

```js
shareScopes: {
  [key: string]: ShareScope;
};
```
