const { fork } = require('child_process')
const isImage = require('./is-image')
const Semaphore = require('@chriscdn/promise-semaphore')

const lock = new Semaphore()

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


	// console.log(`${source} -> ${target}`)

	// only one process should ever write to target at a time
	await lock.acquire(target)

	let f = fork(__dirname + '/_sharpify.js', [JSON.stringify(jargs)])

	return new Promise((resolve, reject) => {
		f.on('exit', code => {
			if (isImage(target)) {
				resolve()
			} else {
				reject(new Error('Sharpify: An unknown error occurred.'))
			}

		})
		f.on('error', err => reject(err))
	})
	.finally(() => lock.release(target))

}