const { fork } = require('child_process')

const defaultArgs = {
	blur: 0,
	saturation: 1,
	width: null,
	height: null,
	fit: 'inside',
	rotate: null
}

module.exports = async function(source, target, args) {

	let jargs = {
		source,
		target,
		...defaultArgs,
		...args
	}

	let f = fork(__dirname + '/_sharpify.js', [JSON.stringify(jargs)])

	return new Promise((resolve, reject) => {
		f.on('exit', code => {
			resolve()
		})
		f.on('error', err => {
			reject(err)
		})

		// f.on('message', message => {
		// 	if (message.error) {

		// 	}
		// })
	})

}