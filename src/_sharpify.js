const sharp = require('sharp');
const args = JSON.parse(process.argv[2]);
const isNumber = require('is-number');
const fsp = require('fs').promises
const isImage = require('./is-image')

const source = args.source
const target = args.target

apply()
	.catch(err => {
		console.log(`--- Sharpify Error: ${source} ---`)
		console.log(err)
		return fsp.unlink(target)
	})
	.catch(err => {
		// just in case unlink files
	})

async function apply() {

	const blur = assertIntegerValue(args.blur, 0, 100)
	const saturation = assertIntegerValue(args.saturation, 0, 1)
	const brightness = assertIntegerValue(args.brightness, 0, 2)
	const rotate = assertIntegerValue(args.rotate, -20, 20)
	const width = assertIntegerValue(args.width, 0, args.width)
	const height = assertIntegerValue(args.height, 0, args.height)
	const withMetadata = !!args.withMetadata
	const withoutEnlargement = !!args.withoutEnlargement

	const fit = args.fit

	const s = await sharp(source)

	if (withMetadata) {
		s = s.withMetadata()
	}

	const metadata = await s.metadata()

	const originalWidth = metadata.width
	const originalHeight = metadata.height
	// console.log(`blur: ${blur}`)
	// 
	if (blur) {
		s = await s.blur(blur)
	}

	if (isNumber(saturation) && saturation < 1) {
		// console.log('wtf')
		s = await s.modulate({
			saturation
		})
	}

	if (isNumber(brightness) && brightness != 1) {
		// console.log('wtf')
		s = await s.modulate({
			brightness
		})
	}

	if (rotate) {
		s = await s.rotate(rotate)

		let box = boxify(originalWidth, originalHeight, rotate)

		s = await s.extract({
			left: box.left,
			top: box.top,
			width: box.width,
			height: box.height
		})
	} else {
		s = await s.rotate()
	}

	if (width || height) {
		s = await s.resize({
			width,
			height,
			fit,
			withoutEnlargement
		})
	}

	await s.toFile(target)

	if (await isImage(target)) {
		// all good! exit gracefully
	} else {
		throw new Error('Invalid target generated.')
	}
}





function assertIntegerValue(value, min, max) {
	if (isNumber(value)) {
		return Math.min(max, Math.max(min, value))
	} else {
		return null
	}
}

function radians(degrees) {
	return degrees * Math.PI / 180
}

function boxify(width, height, degrees) {

	let rads = radians(Math.abs(degrees))

	//  rads = Math.min(rads, Math.PI - rads)

	// console.log(`Mod: ${rads}`)

	// console.log(`degrees: ${degrees}`)
	// console.log(`rads: ${rads}`)

	let sine = Math.sin(rads)
	let cosine = Math.cos(rads)

	// let top = height * cosine - 

	let left = height * sine
	let top = width * sine

	// console.log(`sine: ${sine}`)
	// console.log(`cosine: ${cosine}`)
	// console.log(`left: ${left}`)
	// console.log(`top: ${top}`)

	let bigWidth = height * sine + width * cosine
	let bigHeight = height * cosine + width * sine

	// console.log('')
	// console.log(`bigWidth: ${bigWidth}`)
	// console.log(`bigHeight: ${bigHeight}`)

	let newWidth = bigWidth - 2 * left
	let newHeight = bigHeight - 2 * top

	// let newHeight = newWidth * height / width

	let originalAspectRatio = width / height
	let newAspectRatio = newWidth / newHeight

	if (originalAspectRatio < newAspectRatio) {
		// wider

		let newWidthConstrained = originalAspectRatio * newHeight

		left = left + (newWidth - newWidthConstrained) / 2
		newWidth = newWidthConstrained

	} else {
		// taller
		let newHeightConstrained = newWidth / originalAspectRatio

		top = top + (newHeight - newHeightConstrained) / 2
		newHeight = newHeightConstrained
	}

	return {
		left: Math.round(left),
		top: Math.round(top),
		width: Math.round(newWidth),
		height: Math.round(newHeight),
		aspectRatio: newWidth / newHeight
	}

}