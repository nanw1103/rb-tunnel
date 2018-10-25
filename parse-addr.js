
function parseAddr(text) {
	let [host, port] = text.split(':')
	if (port === undefined) {
		port = host
		host = '0.0.0.0'
	}
	port = Number.parseInt(port)
	if (!Number.isSafeInteger(port))
		throw 'Invalid address: ' + text
	if (host === '')
		host = '0.0.0.0'
		
	return {
		host: host,
		port: port
	}
}

module.exports = parseAddr