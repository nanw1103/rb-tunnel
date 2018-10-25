const net = require('net')
const parseAddr = require('./parse-addr.js')

var uplink
var locallink

function reset() {
	console.log('reset')
	if (uplink) {
		uplink.destroy()
		uplink = null
	}
	if (locallink) {
		locallink.destroy()
		locallink = null
	}
	setTimeout(start, 3000)
}

function newSock(name, host, port, cb) {
	return new net.Socket()
		.setTimeout(20000, () => {
			console.log(name + ' timeout')
			reset()
		})
		//.setNoDelay(true)
		.on('error', e => {
			console.log(name + ' error: ' + e)
			reset()
		}).on('end', () => {
			console.log(name + ' disconnected')
			reset()
		})
		.pause()
		.connect(port, host, () => {
			console.log(name + ' connected')
			cb()
		})
}

function start() {
	console.log('start')
	uplink = newSock('uplink', hubAddr.host, hubAddr.port, () => {
		locallink = newSock('locallink', targetAddr.host, targetAddr.port, () => {
			locallink.pipe(uplink)
			uplink.pipe(locallink)
			uplink.resume()
			locallink.resume()
		})
	})
}

function showUsageAndExit() {
	console.log('Usage:')
	console.log('  node rb-connector.js <rb_hub_host:rb_hub_port> <target_host:target_port>')
	process.exit(10)
}

if (process.argv.length != 4)
	showUsageAndExit()

const uplinkHubAddr = process.argv[2]
const localTargetAddr = process.argv[3]

let hubAddr = parseAddr(uplinkHubAddr)
let targetAddr = parseAddr(localTargetAddr)

console.log(`target (${localTargetAddr})  <-- [ proxy-onprem ] --> public-proxy (${uplinkHubAddr})`)

start()