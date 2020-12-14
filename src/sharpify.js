const workerFarm = require('worker-farm')
const pathExists = require('path-exists')
const Semaphore = require('@chriscdn/promise-semaphore')

const lock = new Semaphore()

const defaultArgs = {
	blur: 0,
	saturation: 1,
	brightness: 1,
	width: null,
	height: null,
	fit: 'inside',
	rotate: null
}

const maxConcurrentWorkers = Math.min(4, require('os').cpus().length)

// https://www.npmjs.com/package/worker-farm#options
const options = {
	maxCallsPerWorker: 50, // restarts process after 50 calls due to sharp memory leaks
	maxRetries: 5,
	maxCallTime: 20000, // 20s?
	maxConcurrentWorkers
}

console.log(`Sharpify Worker Count: ${maxConcurrentWorkers}`)

const sharpifyIt = workerFarm(options, require.resolve('./_sharpify.js'))

module.exports = async (source, target, params) => {

	const args = {
		source,
		target,
		...defaultArgs,
		...params
	}

	await lock.acquire(target)

	return new Promise((resolve, reject) => {
			sharpifyIt(args, (err, target) => {
				if (err) {
					reject(err)
				} else {
					resolve(target)
				}
			})
		})
		.finally(() => lock.release(target))

}