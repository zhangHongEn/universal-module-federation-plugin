let _localStorage = null
try {
  if(!document.getElementById('wpm-iframe')) {
    const wpmIframe = document.createElement('iframe');
    
    wpmIframe.id = 'wpm-iframe';
    wpmIframe.style = 'display: none';
  
    document.body.appendChild(wpmIframe);
  }
  
  _localStorage = document.getElementById('wpm-iframe').contentWindow.localStorage;
} catch(e) {
  _localStorage = window.localStorage
}

export default _localStorage;
