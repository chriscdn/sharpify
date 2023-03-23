import Semaphore from '@chriscdn/promise-semaphore';
import sharp from 'sharp';
import isNumber from 'is-number';
import fs from 'fs';
import { readChunk } from 'read-chunk';
import imageType, { minimumBytes } from 'image-type';

async function isImage(filePath) {
  try {
    const buffer = await readChunk(filePath, { length: minimumBytes });
    const type = await imageType(buffer);
    return ["image/jpeg", "image/png"].includes(type?.mime ?? "");
  } catch (e) {
    return false;
  }
}

fs.promises;
sharp.cache(false);
var sharpifyIt = async (source, target, args, callback) => {
  try {
    const results = await _apply(source, target, args);
    callback(null, results);
  } catch (e) {
    callback(e.message);
  }
};
async function _apply(source, target, args) {
  const blur = assertIntegerValue(args.blur, 0, 100);
  const brightness = assertIntegerValue(args.brightness, 0, 2);
  const fit = args.fit;
  const height = assertIntegerValue(args.height, 0, args.height);
  const normalise = args.normalise;
  const rotate = assertIntegerValue(args.rotate, -20, 20);
  const saturation = assertIntegerValue(args.saturation, 0, 1);
  const width = assertIntegerValue(args.width, 0, args.width);
  const withMetadata = args.withMetadata;
  const withoutEnlargement = args.withoutEnlargement;
  let s = await sharp(source);
  if (withMetadata) {
    s = s.withMetadata();
  }
  const metadata = await s.metadata();
  const originalWidth = metadata.width;
  const originalHeight = metadata.height;
  if (normalise) {
    s = s.normalise();
  }
  if (isNumber(blur) && blur > 0) {
    s = s.blur(blur);
  }
  if (isNumber(saturation) && saturation < 1) {
    s = s.modulate({ saturation });
  }
  if (isNumber(brightness) && brightness != 1) {
    s = s.modulate({ brightness });
  }
  if (rotate !== 0) {
    s = s.rotate(rotate);
    const box = boxify(originalWidth, originalHeight, rotate);
    s = s.extract({
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height
    });
  } else {
    s = s.rotate();
  }
  if (width || height) {
    s = s.resize({
      width,
      height,
      fit,
      withoutEnlargement
    });
  }
  await s.toFile(target);
  if (await isImage(target)) {
    return target;
  } else {
    throw new Error("Invalid target generated.");
  }
}
function assertIntegerValue(value, min, max) {
  if (isNumber(value)) {
    return Math.min(max, Math.max(min, value));
  } else {
    return null;
  }
}
function radians(degrees) {
  return degrees * Math.PI / 180;
}
function boxify(width, height, degrees) {
  const rads = radians(Math.abs(degrees));
  const sine = Math.sin(rads);
  const cosine = Math.cos(rads);
  let left = height * sine;
  let top = width * sine;
  const bigWidth = height * sine + width * cosine;
  const bigHeight = height * cosine + width * sine;
  let newWidth = bigWidth - 2 * left;
  let newHeight = bigHeight - 2 * top;
  const originalAspectRatio = width / height;
  const newAspectRatio = newWidth / newHeight;
  if (originalAspectRatio < newAspectRatio) {
    const newWidthConstrained = originalAspectRatio * newHeight;
    left = left + (newWidth - newWidthConstrained) / 2;
    newWidth = newWidthConstrained;
  } else {
    const newHeightConstrained = newWidth / originalAspectRatio;
    top = top + (newHeight - newHeightConstrained) / 2;
    newHeight = newHeightConstrained;
  }
  return {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(newWidth),
    height: Math.round(newHeight),
    aspectRatio: newWidth / newHeight
  };
}

const semaphore = new Semaphore();
const defaultArgs = {
  blur: 0,
  brightness: 1,
  fit: "inside",
  height: null,
  normalise: false,
  rotate: 0,
  saturation: 1,
  width: null,
  withMetadata: false,
  withoutEnlargement: true
};
var sharpify = async (source, target, params) => {
  const args = {
    ...defaultArgs,
    ...params
  };
  await semaphore.acquire(target);
  return new Promise((resolve, reject) => {
    sharpifyIt(source, target, args, (err, target2) => {
      if (err) {
        reject(err);
      } else {
        resolve(target2);
      }
    });
  }).finally(() => semaphore.release(target));
};

var index = {
  sharpify,
  isImage
};

export { index as default };
//# sourceMappingURL=index.es.js.map
