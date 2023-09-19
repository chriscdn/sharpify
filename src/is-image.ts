export default async function (filePath: string): Promise<boolean> {
  try {
    //
    // Seems necessary for the CJS export to work.
    //
    const { default: imageType } = await import('image-type')
    const { minimumBytes } = await import('image-type')
    const { readChunk } = await import('read-chunk')

    const buffer = await readChunk(filePath, { length: minimumBytes })
    const type = await imageType(buffer)
    return ['image/jpeg', 'image/png'].includes(type?.mime ?? '')
  } catch (e) {
    return false
  }
}
