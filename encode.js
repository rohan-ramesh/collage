// node .\encode.js .\res\7-150x200.bmp 0x62be40e219edea4c .\res\new.bin

const fs = require('fs')
const canvasTools = require('node-canvas')

main()
async function main() {

console.log('THIS IS NOT A REAL CRYPTOGRAPHIC FUNCTION!')

if (process.argv.length !== 5) {
	console.log('Usage: node encode.js <input> <key> <output>')
	process.exit(0)
}

let [input, key, output] = process.argv.slice(2)

let im = await canvasTools.loadImage(fs.readFileSync(input))

let canvas = new canvasTools.Canvas(im.width, im.height)
let ctx = canvas.getContext('2d')
ctx.drawImage(im, 0, 0)

let rgbDataBuf = ctx.getImageData(0, 0, im.width, im.height).data

let rgbData = new DataView(
	rgbDataBuf.filter((_, idx) => idx % 4 !== 3).buffer
)

let rgbOut = encode(rgbData, BigInt(key))

fs.writeFileSync(output, rgbOut)
}

function encode(data, key) {
	let baseKey = key
	const BITMASK = BigInt(2 ** 64) - 1n

	let newData = new DataView(new ArrayBuffer(data.byteLength))
	for (let pos = 0; pos < newData.byteLength; pos += 8) {
		newData.setBigUint64(pos, data.getBigUint64(pos) ^ key)
		key = ((key * 63n) ^ baseKey) & BITMASK
	}
	return newData
}
