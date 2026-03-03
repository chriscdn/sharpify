import { Semaphore } from "@chriscdn/promise-semaphore";
import { sharpifyIt, type SharpifyParameters } from "./_sharpify";

const semaphore = new Semaphore();

const defaultArgs: SharpifyParameters = {
  blur: 0,
  brightness: 1,
  fit: "inside",
  rotate: 0,
  saturation: 1,
  withMetadata: false,
  withoutEnlargement: true,
};

/**
 * @param source The source file path.
 * @param target The destination file path.
 * @param params Sharp parameters.
 * @returns
 */
const sharpify = async (
  source: string,
  target: string,
  params: Partial<SharpifyParameters>,
) => {
  const args: SharpifyParameters = {
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

export { sharpify };
