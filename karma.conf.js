/* eslint-disable @typescript-eslint/no-var-requires */

const { createDefaultConfig } = require('@open-wc/testing-karma');
const merge = require('deepmerge');

module.exports = config => {
  config.set(
    merge(createDefaultConfig(config), {
      files: [
        {
          pattern: config.grep ? config.grep : './dist/**/*.test.js',
          type: 'module',
        },
      ],
      plugins: [require.resolve('@open-wc/karma-esm'), 'karma-*'],
      frameworks: ['esm'],
      esm: {
        nodeResolve: true,
      },
    })
  );

  return config;
};
