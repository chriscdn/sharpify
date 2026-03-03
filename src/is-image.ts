import sharp from "sharp";

const isImage = async (filePath: string) => {
  try {
    await sharp(filePath).resize(1, 1).toBuffer(); // Tries to decode the image
    return true; // If no error, it's valid
  } catch {
    return false; // Corrupt or unsupported image
  }
};

export { isImage };
