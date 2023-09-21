function parseURLQuery() {
	const queryMap = {};

	location
		?.search
		?.slice(1)
		?.split('&')
		?.map(item => {
			const [key, value] = item.split('=');
			queryMap[key] = value || '';
		});

  return queryMap;
}

module.exports = parseURLQuery;
