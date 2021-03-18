import alias from '@rollup/plugin-alias';
import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import multiInput from 'rollup-plugin-multi-input';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { paramCase } from 'change-case';
import path from 'path';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

export default {
  input: ['dist/elements/public/*/index.js'],
  output: {
    dir: 'dist/cdn',
    format: 'esm',
    chunkFileNames: 'shared-[hash].js',
  },
  plugins: [
    multiInput({
      relative: 'dist/elements/public',
      transformOutputPath: output => `foxy-${paramCase(path.dirname(output))}.js`,
    }),
    alias({
      entries: [
        {
          find: /@foxy\.io\/sdk\/(.*)/,
          replacement: '@foxy.io/sdk/dist/esm/$1',
        },
      ],
    }),
    nodeResolve({ browser: true }),
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
    replace({
      'process.env.NODE_ENV': '"production"',
      'process.env.FOXY_CDN': '"https://static.www.foxycart.com/beta/foxy-elements/0.3.0"',
    }),
    terser(),
  ],
};
