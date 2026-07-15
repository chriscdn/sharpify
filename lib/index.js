// src/sharpify.ts
import { Semaphore } from "@chriscdn/promise-semaphore";

// src/_sharpify.ts
import sharp2 from "sharp";
import { isNumber, toNumber } from "@chriscdn/to-number";

// src/is-image.ts
import sharp from "sharp";
var isImage = async (filePath) => {
  try {
    await sharp(filePath).resize(1, 1).toBuffer();
    return true;
  } catch {
    return false;
  }
};

// src/_sharpify.ts
import fs from "fs/promises";
var concurrency = sharp2.concurrency;
sharp2.cache(false);
var sharpifyIt = async (source, target, args) => {
  const blur = clampInteger(args.blur, 0, 100);
  const brightness = clampInteger(args.brightness, 0, 2);
  const fit = args.fit;
  const height = clampInteger(args.height, 0, args.height);
  const rotate = clampInteger(args.rotate, -20, 20);
  const saturation = clampInteger(args.saturation, 0, 1);
  const width = clampInteger(args.width, 0, args.width);
  const withMetadata = args.withMetadata;
  const withoutEnlargement = args.withoutEnlargement;
  let s = await sharp2(source);
  if (withMetadata) {
    s = s.withMetadata();
  }
  const metadata = await s.metadata();
  const originalWidth = metadata.width;
  const originalHeight = metadata.height;
  if (isNumber(blur) && blur > 0) {
    s = s.blur(blur);
  }
  if (isNumber(saturation) && saturation < 1) {
    s = s.modulate({ saturation });
  }
  if (isNumber(brightness) && brightness !== 1) {
    s = s.modulate({ brightness });
  }
  if (isNumber(rotate) && rotate !== 0) {
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
  if (isNumber(width) || isNumber(height)) {
    s = s.resize({
      width: toNumber(width) ?? void 0,
      height: toNumber(height) ?? void 0,
      fit,
      withoutEnlargement
    });
  }
  await s.toFile(target);
  if (await isImage(target)) {
    return target;
  } else {
    await fs.unlink(target).catch((_) => {
    });
    throw new Error("Invalid target generated.");
  }
};
var clampInteger = (value, min, max) => {
  if (isNumber(value)) {
    const _value1 = isNumber(min) ? Math.max(min, value) : value;
    const _value2 = isNumber(max) ? Math.min(max, _value1) : _value1;
    return _value2;
  } else {
    return null;
  }
};
var radians = (degrees) => {
  return degrees * Math.PI / 180;
};
var boxify = (width, height, degrees) => {
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
};

// src/sharpify.ts
var semaphore = new Semaphore();
var defaultArgs = {
  blur: 0,
  brightness: 1,
  fit: "inside",
  rotate: 0,
  saturation: 1,
  withMetadata: false,
  withoutEnlargement: true
};
var sharpify = async (source, target, params) => {
  const args = {
    ...defaultArgs,
    ...params
  };
  try {
    await semaphore.acquire(target);
    return await sharpifyIt(source, target, args);
  } finally {
    semaphore.release(target);
  }
};
export {
  isImage,
  concurrency as sharpConcurrency,
  sharpify
};
//# sourceMappingURL=index.js.map