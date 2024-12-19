import sharp from "sharp";
import { isNumber } from "./is-number";
import { isImage } from "./is-image";
import { FitEnum } from "sharp";
import { Memoize } from "@chriscdn/memoize";

export type SharpifyParameters = {
  blur: number; // https://sharp.pixelplumbing.com/api-operation#blur
  brightness: number;
  fit: keyof FitEnum;
  height: number;
  normalise: boolean; // https://sharp.pixelplumbing.com/api-operation#normalise
  rotate: number;
  saturation: number;
  width: number;
  withMetadata: boolean;
  withoutEnlargement: boolean;
};

// we only ever render the same image once.. no need to cache
sharp.cache(false);

export const sharpifyIt = async (
  source: string,
  target: string,
  args: SharpifyParameters,
) => {
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
    // normalise seems to have minimal effect
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
    // this doesnt take the orientation into account :(
    // https://sharp.pixelplumbing.com/api-operation#rotate
    s = s.rotate(rotate);

    const box = boxify(originalWidth, originalHeight, rotate);

    s = s.extract({
      left: box.left,
      top: box.top,
      width: box.width,
      height: box.height,
    });
  } else {
    // this normalises rotation - see sharp docs
    s = s.rotate();
  }

  if (width || height) {
    s = s.resize({
      width,
      height,
      fit,
      withoutEnlargement,
    });
  }

  await s.toFile(target);

  if (await isImage(target)) {
    // all good! exit gracefully
    return target;
  } else {
    throw new Error("Invalid target generated.");
  }
};

const assertIntegerValue = (
  value: unknown,
  min: number,
  max: number,
): number | null => {
  if (isNumber(value)) {
    return Math.min(max, Math.max(min, value));
  } else {
    return null;
  }
};

const radians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};

const boxify = Memoize((width: number, height: number, degrees: number) => {
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
    // taller
    const newHeightConstrained = newWidth / originalAspectRatio;

    top = top + (newHeight - newHeightConstrained) / 2;
    newHeight = newHeightConstrained;
  }

  return {
    left: Math.round(left),
    top: Math.round(top),
    width: Math.round(newWidth),
    height: Math.round(newHeight),
    aspectRatio: newWidth / newHeight,
  };
});
