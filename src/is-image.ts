import { readChunk } from 'read-chunk'

import imageType, { minimumBytes } from 'image-type'

export default async function (filePath): Promise<boolean> {
  try {
    const buffer = await readChunk(filePath, { length: minimumBytes })
    const type = await imageType(buffer)
    return ['image/jpeg', 'image/png'].includes(type?.mime ?? '')
  } catch (e) {
    return false
  }
}
