import { nodeResolve } from '@rollup/plugin-node-resolve';
import { paramCase } from 'change-case';
import { terser } from 'rollup-plugin-terser';

import multiInput from 'rollup-plugin-multi-input';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import path from 'path';
import env from 'rollup-plugin-inject-process-env';

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
    nodeResolve({ browser: true }),
    commonjs(),
    babel({ babelHelpers: 'bundled' }),
    env({
      NODE_ENV: 'production',
      FOXY_CDN: 'https://static.www.foxycart.com/beta/foxy-elements/0.3.0',
    }),
    terser(),
  ],
};
