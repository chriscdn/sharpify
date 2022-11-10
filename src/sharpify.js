const Semaphore = require('@chriscdn/promise-semaphore')

const lock = new Semaphore()

const defaultArgs = {
  blur: 0,
  saturation: 1,
  brightness: 1,
  width: null,
  height: null,
  fit: 'inside',
  rotate: null,
  withoutEnlargement: true,
}

const sharpifyIt = require('./_sharpify')

module.exports = async (source, target, params) => {
  const args = {
    source,
    target,
    ...defaultArgs,
    ...params,
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
  }).finally(() => lock.release(target))
}
