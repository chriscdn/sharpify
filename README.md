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