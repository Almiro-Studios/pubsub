import dts from 'rollup-plugin-dts';
import terser from '@rollup/plugin-terser';

export default [
  {
    input: 'dist/pubsub.js',
    output: {
      file: 'index.js',
      format: 'cjs',
      name: 'PubSub',
      esModule: true,
    },
    plugins: [terser()]
  },
  {
    input: 'dist/pubsub.d.ts',
    output: {
      file: 'index.d.ts'
    },
    plugins: [dts()]
  }
]