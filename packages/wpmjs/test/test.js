require("../src/index")

const wpmjs = window.wpmjs

const wpmjs1 = new wpmjs.constructor({
  name: "wpmjs1"
})

wpmjs.addImportMap({
  // react: "react@18.0.1/index.js",
  // react1: {
  //   packageName: "",
  //   packageVersion: "",
  //   packageEntryfile: "",
  //   debugUrl: "",
  // },
  // react33: {
  //   url: "https://cdn.jsdelivr.net/npm/react@17.0.2/umd/react.development.js"
  // },
  // react3: "https://aaaa.com"
})

wpmjs.setConfig({
  baseUrl: "https://cdn.jsdelivr.net/npm",
})


wpmjs1.setConfig({
  baseUrl: "https://cdn.jsdelivr.net/npm"
})

wpmjs1.addImportMap({
  "react-dom": {
    "packageVersion": "18.1.0",
    // strictVersion: true
  },
  "react": {
    "packageVersion": "18.1.0"
  },
})
wpmjs1.addImportMap({
  "antd": "antd@5.9.0/dist/antd.min.js",
  "dayjs": "dayjs@1.11.1",
  "react-dom": "react-dom/umd/react-dom.development.js",
  "react": "react/umd/react.development.js",
  "mf-app-01": {
    package: "mf-app-01@1.0.5/dist/remoteEntry.js",
    global: "mfapp01"
  }
})

wpmjs.addImportMap({
  "antd": "antd@5.9.0/dist/antd.js",
  "dayjs": "dayjs@1.11.1",
  "react-dom": {
    "packageVersion": "18.2.0",
    // strictVersion: true
  },
  "react": {
    "packageVersion": "18.2.0"
  },
})
wpmjs.addImportMap({
  "react-dom": "react-dom/umd/react-dom.development.js",
  "react": "react/umd/react.development.js",
  "mf-app-01": {
    package: "mf-app-01@1.0.8/dist/remoteEntry.js",
    global: "mfapp01"
  },
  "mf-app-02": {
    package: "mf-app-02@1.0.5/dist/remoteEntry.js",
    global: "mfapp02"
  }
})

// 卡住两次wpmjs的加载
// window.wpmjs.sleep(new Promise(resolve => {
//   setTimeout(() => {
//     resolve()
//     window.wpmjs.sleep(new Promise(resolve => {
//       setTimeout(() => {
//         resolve()
//       }, 1000)
//     }))
//   }, 1000);
// }))

;(async function main() {
  wpmjs1.import("react-dom")
  const [React, reactDom] = await Promise.all(["react", "react-dom"].map(pkg => wpmjs.import(pkg)));
  const [
    dayjs
  ] = await Promise.all(["dayjs"].map(pkg => wpmjs.import(pkg)));
  window.dayjs = dayjs
  const [
    App1,
    antd,
  ] = await Promise.all(["mf-app-01/App", "antd", "mf-app-02/App"].map(pkg => wpmjs.import(pkg)));

  const div = document.createElement("div")
  document.body.appendChild(div)
  reactDom.render(React.createElement("div", {}, [
    React.createElement(App1.default),
    React.createElement(antd.DatePicker.RangePicker, {
      placeholder: ["antd", "RangePicker"],
    }),
    React.createElement(antd.Button, {}, ["antd button"]),
  ]), div)
})();
global.wpmjs.debug({
  baseUrl: "https://cdn.jsdelivr.net/npm"
})