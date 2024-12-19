# @chriscdn/sharpify

The [sharp](https://www.npmjs.com/package/sharp) package is amazing. But for whatever reason there is a [memory leak](https://github.com/lovell/sharp/issues/955), which I don't understand well enough to work around.

A semaphore was added to prevent multiple asynchronous operations from writing to the same file at the same time.

## Installing

```bash
npm install https://github.com/chriscdn/sharpify
```

Using yarn:

```bash
yarn add https://github.com/chriscdn/sharpify
```

## Usage

```ts
import { sharpify } from "@chriscdn/sharpify";

await sharpify(source, target, options);
```

The promise will reject if for any reason target couldn't be generated.

The default `options` are:

```ts
const options = {
  blur: 0,
  saturation: 1,
  brightness: 1,
  width: null,
  height: null,
  fit: "inside",
  rotate: null,
};
```

- See the [blur](https://sharp.pixelplumbing.com/api-operation#blur) and [modulate](https://sharp.pixelplumbing.com/api-operation#modulate) documentation for details on `blur`, `saturation`, and `brightness`.
- See the [resizing images](https://sharp.pixelplumbing.com/api-resize) documentation for details on `width`, `height`, and `fit`.
- See the [rotate](https://sharp.pixelplumbing.com/api-operation#rotate) documentation for details on `rotate` (units are in degrees).

Rotating will also crop to the edges to create a rectangular image.

## License

[MIT](LICENSE)

This project uses [sharp](https://github.com/lovell/sharp), which is licensed under the Apache License 2.0.
