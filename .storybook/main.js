module.exports = {
  stories: ['../dist/**/*.stories.mdx'],
  addons: [
    'storybook-prebuilt/addon-viewport/register.js',
    'storybook-prebuilt/addon-knobs/register.js',
    'storybook-prebuilt/addon-docs/register.js',
  ],
  esDevServer: {
    moduleDirs: ['node_modules'],
    nodeResolve: true,
    watch: true,
    plugins: [
      require('../plugins/set-node-env')('development'),
      require('../plugins/fix-xstate-chalk-imports'),
      require('../plugins/use-es-version-of-xstate'),
      require('../plugins/fix-jsonata-import'),
      require('../plugins/tailwind'),
    ],
  },
  rollup: config => {
    const copy = require('rollup-plugin-copy');
    const env = require('rollup-plugin-inject-process-env');

    config.plugins.unshift(
      copy({ targets: [{ src: 'translations', dest: 'storybook-static' }] }),
      env({ NODE_ENV: 'production' })
    );

    return config;
  },
};
