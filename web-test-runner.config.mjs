import createTailwindCSS from 'tailwindcss';
import { esbuildPlugin } from '@web/dev-server-esbuild';
import { fromRollup } from '@web/dev-server-rollup';
import { promises as fs } from 'fs';
import postcss from 'postcss';
import rollupBabel from '@rollup/plugin-babel';
import rollupCommonJS from '@rollup/plugin-commonjs';
import rollupJSON from '@rollup/plugin-json';
import rollupReplace from '@rollup/plugin-replace';
import tailwindconfig from './tailwind.config.js';

const tailwindcss = createTailwindCSS(tailwindconfig);
const commonjs = fromRollup(rollupCommonJS);
const replace = fromRollup(rollupReplace);
const babel = fromRollup(rollupBabel.default);
const json = fromRollup(rollupJSON);

export default {
  // can't run tests concurrently as long as we use indexeddb for mock api
  concurrency: 1,

  nodeResolve: true,

  mimeTypes: {
    // serves CJS modules as application/javascript instead of application/node
    // particularly useful for loading node_modules/i18next-http-backend/esm/getFetch.cjs correctly
    '**/*.cjs': 'js',

    // needed for /server/admin/dump.json
    '**/dump.json': 'js',
  },

  middleware: [
    // serves mock translations for legacy Translatable mixin tests
    function serveMockTranslations(context, next) {
      if (context.url.startsWith('/translations')) context.url = `/src/mocks${context.url}`;
      return next();
    },
  ],

  plugins: [
    json(),

    esbuildPlugin({ ts: true }),

    replace({
      // sets environment, removing process references
      // makes loading node_modules/xstate/es/environment.js possible
      'process.env.NODE_ENV': JSON.stringify('production'),
    }),

    babel({
      babelHelpers: 'bundled',
      plugins: [
        [
          'babel-plugin-module-resolver',
          {
            alias: {
              // cross-fetch insists on loading node-ponyfill.js in the browser, but we politely decline
              'cross-fetch': 'cross-fetch/dist/browser-ponyfill.js',

              // same thing with consola – explicitly route to browser build
              consola: 'consola/dist/consola.browser.js',
            },
          },
        ],
      ],
    }),

    {
      // @rollup/plugin-commonjs doesn't convert cross-fetch to esm correctly,
      // so we do it manually here instead
      name: '@foxy.io/elements::fix-cross-fetch-import-plugin',
      transform(context) {
        if (context.url.endsWith('/cross-fetch/dist/browser-ponyfill.js')) {
          context.body = `
            var exports = {};
            var module = {};
    
            ${context.body}
    
            export const fetch = __self__.fetch;
            export const Headers = __self__.Headers;
            export const Request = __self__.Request;
            export const Response = __self__.Response;
    
            export default fetch;
          `;
        }

        return context;
      },
    },

    {
      // i18next-http-backend has a mix of CJS and ESM that results in an incorrect
      // output when converted automatically, so we do it ourselves
      name: '@foxy.io/elements::fix-i18next-http-backend-import-plugin',
      transform(context) {
        if (context.url.endsWith('/i18next-http-backend/esm/getFetch.cjs')) {
          context.body = `export default window.fetch`;
        }

        return context;
      },
    },

    {
      // xstate files seem to get resolved correctly at first, but then at some
      // point CJS bundle starts to leak through – this tiny plugin prevents that from happening
      name: '@foxy.io/elements::fix-xstate-import-plugin',
      transform({ body }) {
        return { body: body.replace(/xstate\/.*\/?(lib)/gi, m => m.replace('lib', 'es')) };
      },
    },

    {
      // chalk (imported by xstate) is resolved to a node build for some reason,
      // this plugin makes things right by rewriting the imports to the correct file
      name: '@foxy.io/elements::fix-chalk-import-plugin',
      transform({ path, body }) {
        if (path.includes('/node_modules/xstate') || path.includes('/node_modules/@xstate')) {
          return { body: body.replace(/\/slimChalk/gi, '/slimChalk.browser') };
        }
      },
    },

    {
      // this plugin generates tailwind styles and injects
      // them into themeable.js in a string template literal
      async transform(context) {
        if (!context.path.endsWith('themeable.ts')) return;

        const escape = v => v.replace(/\\/gi, '\\\\').replace(/`/gi, '\\`');
        const plugins = [tailwindcss];
        const from = './tailwind.css';
        const tailwindBuild = await postcss(plugins).process(await fs.readFile(from), { from });

        return {
          body: context.body.replace('{{ output }}', escape(tailwindBuild.css)),
        };
      },
    },

    commonjs({
      include: [
        '**/indexeddb-export-import/**/*',
        '**/email-validator/**/*',
        '**/url-pattern/**/*',
        '**/traverse/**/*',
        '**/consola/**/*',
        '**/jsonata/**/*',
        '**/halson/**/*',
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
  ],
};
