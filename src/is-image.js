const readChunk = require('read-chunk')
const imageType = require('image-type')

module.exports = async function(filePath) {
	try {
		const buffer = await readChunk(filePath, 0, 12)
		const type = imageType(buffer)
		return ['image/jpeg', 'image/png'].includes(type.mime)
	} catch (e) {
		return false
	}
}