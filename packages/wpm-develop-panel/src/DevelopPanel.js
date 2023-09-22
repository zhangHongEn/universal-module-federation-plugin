import React, {useEffect, useState, lazy, Suspense, useRef, useMemo} from 'react';
import Tabs from 'antd/es/Tabs'; // 加载 JS
import 'antd/es/Tabs/style/css'; // 加载 CSS
import Button from 'antd/es/Button'; // 加载 JS
import 'antd/es/Button/style/css'; // 加载 CSS
import Switch from 'antd/es/Switch'; // 加载 JS
import 'antd/es/Switch/style/css'; // 加载 CSS
import parseURLQuery from './parseURLQuery';
import './DevelopPanel.less';
import {SettingTwoTone} from "@ant-design/icons"
import localStorage from './getLocalStorage';

const { TabPane } = Tabs

const queryMap = parseURLQuery();
let ws = null
let wsConnected = false;
const activePkgMap = function(){
  try {
    return JSON.parse(localStorage.getItem('wpm-activePkgMap')) || {}
  } catch(e) {
    return {}
  }
}()

function getDebugMap() {
  try {
    return JSON.parse(localStorage.getItem("wpm-debug-map") || "{}")
  } catch (e) {
    return {}
  }
}

function panelHandleChange(activePkgMap) {
  localStorage.setItem('wpm-activePkgMap', JSON.stringify(activePkgMap));
  window.location.reload();
}

const LocalPanel = ({connectorList: pkgList}) => <div className="local-panel">
<ul className="package-list">
  {
    pkgList.length ?
      pkgList.map(item => {
        const {name, url} = item;
        return (
          <PackageListItem
            key={name}
            name={name}
            url={url}
            display={!activePkgMap[name]}
            onChange={display => {
              panelHandleChange({...activePkgMap, [name]: display})
            }}
          />
        )
      })
      : (
        <div style={{textAlign: 'center', padding: 20, color: '#aaa'}}>
          <div>not found local dev-server</div>
        </div>
      )
  }
</ul>
</div> 

function ArouseButton(props) {
  return (
    <div className="arouse-button" style={{padding: 10}} onClick={props.onClick}>
      <SettingTwoTone className="icon" />
      <span style={{paddingTop: 8}}>W</span>
      <span style={{paddingTop: 5}}>P</span>
      <span style={{paddingTop: 5}}>M</span>
    </div>
  )
}

function PackageListItem(props) {
  const {display, onChange, name, url} = props;
  return (
    <li className="package-list-item">
      <div className='switch-area'>
        <Switch size="small" checked={!display} onChange={onChange}/>
        <span className='text'>
          {name}
        </span>
      </div>
      <div className="pack-url">{url}</div>
    </li>
  )
}

function Panel(props) {
  const {pluginComponents} = props
  const storageShowPanel = localStorage.getItem("wpm-dev-panel-default-show") || "connect"
  const queryParamShowPanel = queryMap["defaultPlugin"]
  console.log("storage value: ", storageShowPanel, queryParamShowPanel)
  const {onPackUp, onClose, pkgList} = props;

  const [curShowPanel, setCurShowPanel] = useState(storageShowPanel || queryParamShowPanel || "local")

  const switchPanelType = type => {
    localStorage.setItem("wpm-dev-panel-default-show", type)
    // 切换逻辑
    setCurShowPanel(type)
  }

  return (
    <div className="panel">
      <Tabs
        size="small"
        activeKey={curShowPanel}
        onChange={ key => switchPanelType(key) }
      >
        {
        pluginComponents.map(({key, Component}) => {
          return (<TabPane tab={key} key={key}>
            <Component connectorList={pkgList} localStorage={localStorage} />
          </TabPane>)
        })
        }
      </Tabs>
      <div className="panel-foot">
        <Button className="refresh-button" type="link" onClick={onClose}>退出</Button>
        <Button className="pack-up-button" type="link" onClick={onPackUp}>收起</Button>
      </div>
    </div>
  )
}

function Main(props) {
  const {plugins, baseUrl} = props

  const pluginComponents = useMemo(function() {
    return plugins.map(key => {
      if (key === "connect") {
        return {
          key,
          Component: LocalPanel
        }
      }
      const pkg = `wpm-develop-${key}`
      window.wpmjsDebug.addImportMap({
        [pkg]: {
          packageName: pkg,
          moduleType: "system",
          packageFilename: "dist/index.js",
        }
      })
      const PreviewComp = lazy(async () => {
        try {
          return await window.wpmjsDebug.import(pkg)
        } catch(e) {
          return {
            default() {
              return `${pkg} fail`
            },
            __esModule: true
          }
        }
      })
  
      const AsyncPreviewComp = props => <Suspense fallback={<div>loading...</div>}>
        <PreviewComp {...props} />
      </Suspense>
      return {
        key,
        Component: AsyncPreviewComp
      }
    })
  }, [plugins])
  
  const [display, setDisplay] = useState(true);

  const [pkgList, setPkgList] = useState(JSON.parse(localStorage.getItem('wpm-pkgList')) || []);
  function updatePkgList() {
    const wpmDebugMap = getDebugMap()
    const list = JSON.parse(localStorage.getItem('wpm-pkgList'))
    const mapList = Object.keys(wpmDebugMap).map(name => {
      return {
        name,
        url: wpmDebugMap[name]
      }
    })
    setPkgList([...list, ...mapList])
  }

  function handleClose() {
    const keys = Object.keys(queryMap).filter(k => k !== 'wpmDebug');
    const query = keys.length ? '?' + keys.map(k => `${k}=${queryMap[k]}`).join('&') : '';

    localStorage.removeItem('wpm-debug-open');
    window.location.href = window.location.href.replace(/\?[^\#]+/, query);
  }

  function initWS(){
    ws = new WebSocket('ws://localhost:9120');
    ws.onopen = function () {
      console.log('dev panel ws connected');
      wsConnected = true;
    }
    ws.onmessage = function(event) {
      const data = event.data;
      try {
        const {type, list=[]} = JSON.parse(data);
        if (type === 'change'){
          const wpmDebugMap = getDebugMap()
          const mapList = Object.keys(wpmDebugMap).map(name => {
            return {
              name,
              url: wpmDebugMap[name]
            }
          })
          localStorage.setItem('wpm-pkgList', JSON.stringify(list));
          updatePkgList()
        }
      }catch (e){
        console.log('dev panel error->',e)
      }
    };
  }

  useEffect(() => {
    // getPkgList();
    // setInterval(() => {
    //   getPkgList();
    // }, 5000)
    initWS()
  }, []);
  return (
    <div className="wpmjs-develop-panel">
      <div className={ `root ${display ? 'panel-show' : 'panel-hidden'}` }>
      {
        display
          ? <Panel
            pluginComponents={pluginComponents}
            pkgList={pkgList}
            onPackUp={() => setDisplay(false)}
            onClose={handleClose}
          />
          : <ArouseButton onClick={() => setDisplay(true)}/>
      }
    </div>
    </div>
  )
}
Main.defaultProps = {
  plugins: []
}

export default Main;
