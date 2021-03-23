import alias from '@rollup/plugin-alias';
import babelPlugin from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';
import multiInputPlugin from 'rollup-plugin-multi-input';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { paramCase } from 'change-case';
import path from 'path';
import replace from '@rollup/plugin-replace';
import tailwindConfig from './tailwind.config.js';
import tailwindInJs from './.build/rollup-plugin-tailwind-in-js.js';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

const multiInput = multiInputPlugin.default;
const babel = babelPlugin.default;

export default {
  input: ['src/elements/public/*/index.ts'],
  output: {
    dir: 'dist/cdn',
    format: 'esm',
    chunkFileNames: 'shared-[hash].js',
  },
  plugins: [
    multiInput({
      relative: 'src/elements/public',
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
    tailwindInJs({ config: tailwindConfig, extensions: ['.ts'] }),
    typescript({ outDir: 'dist/cdn' }),
    commonjs(),

    babel({
      babelHelpers: 'bundled',
      extensions: ['.ts'],
      plugins: [
        [
          'template-html-minifier',
          {
            modules: {
              'lit-html': ['html'],
              'lit-element': ['html', { name: 'css', encapsulation: 'style' }],
            },
            strictCSS: true,
            htmlMinifier: {
              collapseWhitespace: true,
              conservativeCollapse: true,
              removeComments: true,
              caseSensitive: true,
              minifyCSS: true,
            },
          },
        ],
      ],
      presets: [
        [
          '@babel/preset-env',
          {
            spec: true,
            bugfixes: true,
            modules: false,
            targets: {
              esmodules: true,
            },
          },
        ],
      ],
    }),

    replace({
      'process.env.NODE_ENV': '"production"',
      'process.env.FOXY_CDN': '"https://static.www.foxycart.com/beta/foxy-elements/0.3.0"',
    }),

    terser(),
    copy({ targets: [{ src: 'src/static/translations/*', dest: 'dist/cdn/translations' }] }),
  ],
};
