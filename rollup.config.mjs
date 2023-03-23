import pkg from './package.json' assert { type: 'json' }

import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'

const input = 'src/index.ts'

export default [
  {
    input,
    output: [
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
      },
    ],
    external: [...Object.keys(pkg.dependencies || [])],
    plugins: [esbuild()],
  },

  {
    input,
    output: [
      {
        file: pkg.module,
        format: 'es',
        sourcemap: true,
      },
    ],
    external: [...Object.keys(pkg.dependencies || {})],
    plugins: [esbuild()],
  },

  {
    input,
    plugins: [dts()],
    output: {
      file: pkg.types,
      format: 'es',
      // globals,
    },
  },
]
