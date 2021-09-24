import binData from 'url:../res/new.bin'

const $ = x => document.querySelector(x)
const $$ = x => document.querySelectorAll(x)

const CORRECT_KEY = 0x62be_40e2_19ed_ea4cn

let inputPlaceholderCnt = 0
let allInputs = []
let RAW_DATA
let resultCtx

main()

async function main() {
	let res = await fetch(binData)
	RAW_DATA = new DataView(await res.arrayBuffer())

	for (let el of $$('.input-group')) {
		createInputGroup(el)
	}

	let resultCanvas = $('#result')
	resultCanvas.width = 150
	resultCanvas.height = 200
	resultCtx = resultCanvas.getContext('2d')
}

function createInputGroup(el) {
	const LENGTH = 4

	let inputs = []
	for (let i = 0; i < LENGTH; i++) {
		let ip = document.createElement('input')
		ip.className = 'input-field'
		ip.maxLength = 1
		ip.placeholder = (inputPlaceholderCnt++).toString(16).toUpperCase()
		inputs.push(ip)
		allInputs.push(ip)
		el.appendChild(ip)
	}

	for (let i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener('keydown', evt => {
			if (evt.key === 'Backspace') {
				if (inputs[i].value === '') {
					if (i !== 0) {
						inputs[i - 1].focus()
						inputs[i - 1].select()
					}
				} else {
					inputs[i].value = ''
				}

			} else if (evt.key === 'ArrowLeft' && i !== 0) {
				inputs[i - 1].focus()
				inputs[i - 1].select()
			} else if (evt.key === 'ArrowRight' && i !== inputs.length - 1) {
				inputs[i + 1].focus()
				inputs[i + 1].select()
			}
		})

		inputs[i].addEventListener('input', () => {
			inputs[i].value = inputs[i].value.toUpperCase()

			// Validate input
			let val = inputs[i].value.charCodeAt(0)
			let cl = inputs[i].classList
			if ((val < 48 || val > 57) && (val < 65 || val > 70)) {
				cl.add('error')
			} else {
				cl.remove('error')
			}

			render()

			if (i === inputs.length - 1 && inputs[i].value !== '') {
				return true
			} else if (inputs[i].value !== '') {
				inputs[i + 1].focus()
				inputs[i + 1].select()
			}
		})

		inputs[i].addEventListener('click', () => {
			inputs[i].select()
		})
	}
}

function render() {
	let key = allInputs.reduce((acc, cur) => {
		let num = parseInt(cur.value, 16)
		if (Number.isNaN(num)) {
			num = 0
		}
		return (acc << 4n) + BigInt(num)
	}, 0n)

	setColor(key === CORRECT_KEY ? 'green' : 'red')
	writeImage(key, resultCtx)
}

// THIS IS NOT A REAL CRYPTOGRAPHIC FUNCTION!
function decode(key) {
	let baseKey = key
	const BITMASK = BigInt(2 ** 64) - 1n

	let newData = new DataView(new ArrayBuffer(RAW_DATA.byteLength))
	for (let pos = 0; pos < newData.byteLength; pos += 8) {
		newData.setBigUint64(pos, RAW_DATA.getBigUint64(pos) ^ key)
		key = ((key * 63n) ^ baseKey) & BITMASK
	}
	return newData
}

function writeImage(key, ctx) {
	let oldArray = new Uint8Array(decode(key).buffer)

	// Add the alpha channel back
	let newArray = new Uint8ClampedArray(oldArray.length * 4 / 3)
	for (let pos = 0; pos < oldArray.length; pos++) {
		newArray[pos*4]     = oldArray[pos*3]
		newArray[pos*4 + 1] = oldArray[pos*3 + 1]
		newArray[pos*4 + 2] = oldArray[pos*3 + 2]
		newArray[pos*4 + 3] = 0xff
	}
	
	let imageData = new ImageData(newArray, 150)
	ctx.putImageData(imageData, 0, 0)
}

function setColor(color) {
	document.body.style.cssText = `--varies: var(--${color});`
	let unset = $('.unset')
	if (unset !== null) {
		unset.classList.remove('unset')
	}
}

//function configureSVG
