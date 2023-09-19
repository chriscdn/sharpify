import Semaphore from '@chriscdn/promise-semaphore'
import sharpifyIt, { SharpifyParameters } from './_sharpify'

const semaphore = new Semaphore()

const defaultArgs: SharpifyParameters = {
  blur: 0,
  brightness: 1,
  fit: 'inside',
  height: null,
  normalise: false,
  rotate: 0,
  saturation: 1,
  width: null,
  withMetadata: false,
  withoutEnlargement: true,
}

export default async (source: string, target: string, params: Partial<SharpifyParameters>) => {
  const args = {
    ...defaultArgs,
    ...params,
  }

  await semaphore.acquire(target)

  return new Promise((resolve, reject) => {
    sharpifyIt(source, target, args, (err, target) => {
      if (err) {
        reject(err)
      } else {
        resolve(target)
      }
    })
  }).finally(() => semaphore.release(target))
}
