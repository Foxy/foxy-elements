import { compatPlugin } from './.build/compat-plugin.js';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fromRollup } from '@web/dev-server-rollup';
import rollupBabel from '@rollup/plugin-babel';
import rollupCommonJS from '@rollup/plugin-commonjs';
import rollupJSON from '@rollup/plugin-json';
import rollupReplace from '@rollup/plugin-replace';
import rollupTailwindInJs from './.build/rollup-plugin-tailwind-in-js.cjs';
import { fileURLToPath } from 'url';
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
    '**/custom-elements.json': 'js',
  },

  middleware: [
    (context, next) => {
      const url = context.url;
      const prefix = '/src/static';
      const staticPaths = ['/translations', '/images', '/logo-light.png', '/logo-dark.png'];
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
        '**/check-password-strength/**/*',
        '**/email-validator/**/*',
        '**/cookie-storage/**/*',
        '**/html-entities/**/*',
        '**/highlight.js/**/*',
        '**/url-pattern/**/*',
        '**/traverse/**/*',
        '**/consola/**/*',
        '**/jsonata/**/*',
        '**/uainfer/**/*',
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
    replacePlugin({
      'process.env.NODE_ENV': '"production"',
      'embed.foxy.io': 'embed.foxy.test',
    }),
    // Point esbuild at the project tsconfig so wds, wtr and Storybook compile TypeScript with
    // the same class field semantics as the production build. Without it the plugin passes no
    // tsconfigRaw at all, and `target: 'auto'` resolves to `esnext` on Chromium, which turns
    // `useDefineForClassFields` on: a plain field with an initializer then becomes an own
    // instance property that shadows the reactive accessor lit-element installs on the
    // prototype, so assignments stop scheduling an update. Note that tsconfig.json has to set
    // `useDefineForClassFields` explicitly — esbuild 0.17 does not derive it from `target`.
    // `target` is set independently of the tsconfig: esbuild cannot downlevel async
    // generator functions to the tsconfig's es2018 target ("Transforming async generator
    // functions to the configured target environment is not supported yet"), which broke
    // Storybook for the three elements whose gravatar helpers use `async *`. Setting the
    // target here overrides only the target — `useDefineForClassFields: false` still comes
    // from the tsconfig, so the class-field semantics fix above is unaffected.
    esbuildPlugin({
      ts: true,
      target: 'es2020',
      tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
    }),
    compatPlugin(),
    jsonPlugin(),
  ],
};
