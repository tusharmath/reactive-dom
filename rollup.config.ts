import * as fs from 'fs'

const commonjs = require('rollup-plugin-commonjs')
const uglify = require('rollup-plugin-babili')

const pkg = JSON.parse(fs.readFileSync('./package.json').toString())
const external = Object.keys(pkg.dependencies || {})

const name = 'reactive-dom'
const input = pkg['main'] || './index.js'

const globals = {
  'observable-air': 'O'
}
export = [
  {
    input: input,
    external,
    output: {
      exports: 'named',
      name: 'O.dom',
      format: 'umd',
      file: `./.dist/${name}.umd.min.js`,
      sourcemap: true,
      globals
    },
    plugins: [commonjs(), uglify({comments: false})]
  },
  {
    input: input,
    external,
    output: {
      exports: 'named',
      name: 'O.dom',
      format: 'umd',
      file: `./.dist/${name}.umd.dev.js`,
      sourcemap: true,
      globals
    },
    plugins: [commonjs()]
  },
  {
    input,
    external,
    output: {
      globals,
      format: 'es',
      file: `./.dist/${name}.es.dev.js`,
      sourcemap: true
    },
    plugins: [commonjs({})]
  },
  {
    input,
    external,
    output: {
      globals,
      format: 'es',
      file: `./.dist/${name}.es.min.js`,
      sourcemap: true
    },
    plugins: [commonjs({}), uglify({comments: false})]
  }
]
