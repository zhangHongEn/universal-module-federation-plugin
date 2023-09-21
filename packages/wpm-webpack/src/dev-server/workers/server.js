const express = require('express')
const bodyParser = require('body-parser');
const lodash = require('lodash')
const findFreePort = require('find-port-free-sync');
const detect = require('detect-port');
const log = require('../utils/log')
const {setValueInRootConfigs} = require('../utils/index')
const {WebSocketServer} = require('ws');

const app = express()
let wsPool = []

//设置跨域访问
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1')
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())

const Result_Map = {}

function startDebugServer() {
  app.get('/list', function (req, res) {
    try {

      res.json({
        code: 200,
        message: "success",
        data: generateList()
      })
    } catch (e) {
      res.json({
        code: 500,
        message: "内部错误",
      })
      console.log(e)
    }
  })

  app.post('/update', function (req, res) {
    try {
      const body = req.body
      Result_Map[body.name] = body.list
      res.json({
        code: 200,
        message: "success",
      })
      notifyAllClients()
    } catch (e) {
      console.log(e)
      res.json({
        code: 500,
        message: "内部错误",
      })
    }
  })

  app.post('/delete', function (req, res) {
    try {
      const body = req.body
      const pkgName = body.pkgName
      const keys = Object.keys(Result_Map).filter(k => k.includes(pkgName))
      keys.forEach(k => {
        delete Result_Map[k]
      })
      res.json({
        code: 200,
        message: "success",
      })
      notifyAllClients()
    } catch (e) {
      console.log(e)
      res.json({
        code: 500,
        message: "内部错误",
      })
    }
  })

  const defaultWsPort = 9120
  detect(defaultWsPort, (err, _port) => {
    if (err) {
      start(findFreePort({start: 4000}))
      return
    }
    start(_port)
  })


  function start(port) {
    const defaultHttpPort = findFreePort({start: 4000})
    setValueInRootConfigs('ChildProcessServerPort', defaultHttpPort)
    app.listen(defaultHttpPort, () => {
      log.alert(`💡💡💡💡💡💡 WPM http 端口为 ${defaultHttpPort}`)
    })
    setValueInRootConfigs('ChildProcessWebsocketPort', port)
    const wss = new WebSocketServer({port: port}, () => {
      log.alert(`💡💡💡💡💡💡WPM websocket调试端口为 ${port}，如需要，请在调试面板输入 💡💡💡💡💡💡`)
    });
    wss.on('connection', function (instance) {
      wsPool.push(instance)
      notifyAllClients()
      instance.on('message', function message(data, isBinary) {
        const message = isBinary ? data : data.toString();
        if (message === 'give me latest list'){
          notifyAllClients()
        }
      });
    },error=>{
      console.log('error---->',error)
    });
  }
}

function notifyAllClients(){
  wsPool.forEach(ws=>{
    ws.send(JSON.stringify({
      type:'change',
      list:generateList()
    }))
  })
}

function generateList(){
  let results = []
  for (const key of Object.keys(Result_Map)) {
    const list = Result_Map[key]
    results = results.concat(list)
  }
  return lodash.uniqBy(results, 'url')
}

startDebugServer()
