/* eslint-disable @typescript-eslint/no-var-requires */

const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      client: {
        mocha: {
          timeout: 6000,
        },
      },
      files: [
        {
          pattern: config.grep ? config.grep : './dist/**/*.test.js',
          type: 'module',
        },
        {
          pattern: './src/mocks/translations/**/*.json',
          included: false,
          nocache: false,
          watched: false,
          served: true,
        },
      ],
      proxies: {
        '/translations/': '/base/src/mocks/translations/',
      },
      plugins: [require.resolve('@open-wc/karma-esm'), 'karma-*'],
      frameworks: ['esm'],
      esm: {
        nodeResolve: true,
        coverageExclude: ['dist/**/*.test.js'],
        plugins: [
          require('./plugins/set-node-env')('production'),
          require('./plugins/fix-xstate-chalk-imports'),
          require('./plugins/use-es-version-of-xstate'),
          require('./plugins/tailwind'),
        ],
      },
    })
  );

  return config;
};
