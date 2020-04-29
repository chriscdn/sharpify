# @chriscdn/sharpify

The [sharp](https://www.npmjs.com/package/sharp) package is amazing.  But for whatever reason there is a [memory leak](https://github.com/lovell/sharp/issues/955), which I don't understand well enough to work around.

This little utility creates a child process for each sharp operation, which prevents the memory leak.  A subset of operations are supported.

## Installing

```bash
$ npm install https://github.com/chriscdn/sharpify
```

Using yarn:

```bash
$ yarn add https://github.com/chriscdn/sharpify
```

## Usage

```js
const sharpify = require('@chriscdn/sharpify')

await sharpify(source, target, options)
```

The default `options` are:

```js
const defaultArgs = {
	blur: 0,
	saturation: 1,
	width: null,
	height: null,
	fit: 'inside',
	rotate: null
}
```

- See the [blur](https://sharp.pixelplumbing.com/api-operation#blur) and [modulate](https://sharp.pixelplumbing.com/api-operation#modulate) documentation for details on `blur` and `saturation`.
- See the [resizing images](https://sharp.pixelplumbing.com/api-resize) documentation for details on `width`, `height`, and `fit`.
- See the [rotate](https://sharp.pixelplumbing.com/api-operation#rotate) documentation for details on `rotate` (units are in degrees).

Rotating will also crop to the edges to create a rectangular image.