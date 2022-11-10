const sharp = require('sharp')
const isNumber = require('is-number')
const fsp = require('fs').promises
const isImage = require('./is-image')

// we only ever render the same image once.. no need to cache
sharp.cache(false)

module.exports = async (args, callback) => {
  try {
    const results = await _apply(args)
    callback(null, results)
  } catch (e) {
    callback(e.message)
  }
}

async function _apply(args) {
  const source = args.source
  const target = args.target

  const blur = assertIntegerValue(args.blur, 0, 100)
  const saturation = assertIntegerValue(args.saturation, 0, 1)
  const brightness = assertIntegerValue(args.brightness, 0, 2)
  const rotate = assertIntegerValue(args.rotate, -20, 20)
  const width = assertIntegerValue(args.width, 0, args.width)
  const height = assertIntegerValue(args.height, 0, args.height)
  const withMetadata = !!args.withMetadata
  const withoutEnlargement = !!args.withoutEnlargement
  const normalise = !!(args.normalise || args.normalize)

  const fit = args.fit

  let s = await sharp(source)

  if (withMetadata) {
    s = s.withMetadata()
  }

  const metadata = await s.metadata()

  const originalWidth = metadata.width
  const originalHeight = metadata.height

  if (normalise) {
    // normalise seems to have minimal effect
    s = s.normalise()
  }

  if (blur) {
    s = s.blur(blur)
  }

  if (isNumber(saturation) && saturation < 1) {
    s = s.modulate({
      saturation,
    })
  }

  if (isNumber(brightness) && brightness != 1) {
    s = s.modulate({
      brightness,
    })
  }

  if (rotate) {
    // this doesnt take the orientation into account :(
    // https://sharp.pixelplumbing.com/api-operation#rotate
    s = s.rotate(rotate)

    const box = boxify(originalWidth, originalHeight, rotate)

    s = s.extract({
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
    })
  } else {
    // this normalises rotation - see sharp docs
    s = s.rotate()
  }

  if (width || height) {
    s = s.resize({
      width,
      height,
      fit,
      withoutEnlargement,
    })
  }

  await s.toFile(target)

  if (await isImage(target)) {
    // all good! exit gracefully
    return target
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
  return (degrees * Math.PI) / 180
}

function boxify(width, height, degrees) {
  const rads = radians(Math.abs(degrees))

  const sine = Math.sin(rads)
  const cosine = Math.cos(rads)

  let left = height * sine
  let top = width * sine

  const bigWidth = height * sine + width * cosine
  const bigHeight = height * cosine + width * sine

  let newWidth = bigWidth - 2 * left
  let newHeight = bigHeight - 2 * top

  const originalAspectRatio = width / height
  const newAspectRatio = newWidth / newHeight

  if (originalAspectRatio < newAspectRatio) {
    const newWidthConstrained = originalAspectRatio * newHeight

    left = left + (newWidth - newWidthConstrained) / 2
    newWidth = newWidthConstrained
  } else {
    // taller
    const newHeightConstrained = newWidth / originalAspectRatio

    top = top + (newHeight - newHeightConstrained) / 2
    newHeight = newHeightConstrained
  }

  return {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(newWidth),
    height: Math.round(newHeight),
    aspectRatio: newWidth / newHeight,
  }
}
