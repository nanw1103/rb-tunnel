
const net = require('net')
const parseAddr = require('./parse-addr.js')

function reset() {
	console.log('reset')
	if (onpremStream) {
		onpremStream.destroy()
		onpremStream = null
	}
	if (clientStream) {
		clientStream.destroy()
		clientStream = null
	}
}
const clientConnector = net.createServer((c) => {
	c.setTimeout(10000)
	// 'connection' listener
	console.log('client connected')
	c.on('end', () => {
		console.log('client disconnected')
	}).on('error', e => {
		console.log('client disconnected: ' + e)
		reset()
	})
	if (!onpremStream) {
		reset()
		return
	}
	if (clientStream) {
		reset()
		return
	}
	clientStream = c
	clientStream.pipe(onpremStream)
	onpremStream.pipe(clientStream)
}).on('error', (err) => {
	console.log(err)
	reset()
})

var onpremStream
var clientStream

const onPremConnector = net.createServer((c) => {
	c.setTimeout(10000)
	// 'connection' listener
	console.log('onprem connected')
	c.on('end', () => {
		console.log('onprem disconnected')
	}).on('error', e => {
		console.log('onprem disconnected: ' + e)
		reset()
	})
	onpremStream = c
}).on('error', (err) => {
	console.log(err)
	reset()
})

function showUsageAndExit() {
	console.log('Usage:')
	console.log('  node rb-hub.js <[iface1:]connector_port> <[iface:]client_port>')
	process.exit(10)
}

if (process.argv.length != 4)
	showUsageAndExit()


let addr1 = parseAddr(process.argv[2])
let addr2 = parseAddr(process.argv[3])

console.log(`rb-connector  --> [ ${process.argv[2]} ===rb_hub=== ${process.argv[3]} ] <-- client`)

onPremConnector.listen(addr1.port, addr1.host, e => {
	if (e) {
		console.error(e)
		process.exit(1)
	}
	console.log('onprem bound')
})

clientConnector.listen(addr2.port, addr2.host, e => {
	if (e) {
		console.error(e)
		process.exit(2)
	}
	console.log('client bound')
})