
import * as React from 'react';
import ReactDOM from 'react-dom';
import DevelopPanel from './DevelopPanel';
import localStorage from './getLocalStorage';

function main(config) {

	if (!localStorage.getItem("wpm-debug-url")) {
		localStorage.setItem("wpm-debug-url", 'http://localhost:9120')
	}

  const el = document.createElement('div');
	
	el.id = 'wpmjs-dev-panel';

	document.body.appendChild(el);
	ReactDOM.render(<DevelopPanel {...config} />, el);
}

export default async function init(config = {}){
	if(!document.getElementById('wpmjs-dev-panel')) {
		const {
			plugins = ["connect", "alias"],
			baseUrl = ""
		} = config
		main({
			plugins,
			baseUrl
		})
	}
}