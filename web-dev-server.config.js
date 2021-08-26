import { compatPlugin } from './.build/compat-plugin.js';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fromRollup } from '@web/dev-server-rollup';
import rollupBabel from '@rollup/plugin-babel';
import rollupCommonJS from '@rollup/plugin-commonjs';
import rollupJSON from '@rollup/plugin-json';
import rollupReplace from '@rollup/plugin-replace';
import rollupTailwindInJs from './.build/rollup-plugin-tailwind-in-js.cjs';
import { storybookPlugin } from '@web/dev-server-storybook';
import tailwindConfig from './tailwind.config.cjs';

const tailwindInJsPlugin = fromRollup(rollupTailwindInJs);
const commonjsPlugin = fromRollup(rollupCommonJS);
const replacePlugin = fromRollup(rollupReplace);
const babelPlugin = fromRollup(rollupBabel.default);
const jsonPlugin = fromRollup(rollupJSON);

export default {
  nodeResolve: true,

  mimeTypes: {
    '**/*.cjs': 'js',
    '**/dump.json': 'js',
    '**/custom-elements.json': 'js',
  },

  middleware: [
    (context, next) => {
      const url = context.url;
      const prefix = '/src/static';
      const staticPaths = ['/translations', '/images', '/logo.png'];
      if (staticPaths.some(path => url.startsWith(path))) context.url = `${prefix}${url}`;
      return next();
    },
  ],

  plugins: [
    tailwindInJsPlugin({
      config: { ...tailwindConfig, purge: false },
      extensions: ['.ts'],
    }),

    commonjsPlugin({
      include: [
        '**/indexeddb-export-import/**/*',
        '**/email-validator/**/*',
        '**/cookie-storage/**/*',
        '**/highlight.js/**/*',
        '**/url-pattern/**/*',
        '**/traverse/**/*',
        '**/consola/**/*',
        '**/jsonata/**/*',
        '**/halson/**/*',
        '**/dedent/**/*',
        '**/@babel/**/*',
        '**/chalk/**/*',
      ],

      exclude: [
        '**/@web/**/*',
        '**/@open-wc/**/*',
        '**/cross-fetch/**/*',
        '**/i18next-http-backend/**/*',
      ],
    }),

    babelPlugin({
      babelHelpers: 'bundled',
      plugins: [
        [
          'babel-plugin-module-resolver',
          {
            alias: {
              'cross-fetch': 'cross-fetch/dist/browser-ponyfill.js',
              'consola': 'consola/dist/consola.browser.js',
            },
          },
        ],
      ],
    }),

    storybookPlugin({ type: 'web-components' }),
    replacePlugin({ 'process.env.NODE_ENV': '"production"' }),
    esbuildPlugin({ ts: true }),
    compatPlugin(),
    jsonPlugin(),
  ],
};
