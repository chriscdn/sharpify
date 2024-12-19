import Semaphore from "@chriscdn/promise-semaphore";
import { sharpifyIt, type SharpifyParameters } from "./_sharpify";

const semaphore = new Semaphore();

const defaultArgs: SharpifyParameters = {
  blur: 0,
  brightness: 1,
  fit: "inside",
  height: null,
  normalise: false,
  rotate: 0,
  saturation: 1,
  width: null,
  withMetadata: false,
  withoutEnlargement: true,
};

export const sharpify = async (
  source: string,
  target: string,
  params: Partial<SharpifyParameters>,
) => {
  const args = {
    ...defaultArgs,
    ...params,
  };

  try {
    await semaphore.acquire(target);

    return await sharpifyIt(source, target, args);
  } finally {
    semaphore.release(target);
  }
};
