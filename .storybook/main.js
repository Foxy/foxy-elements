const tailwindConfig = require('../tailwind.config.cjs');
const tailwindInJs = require('../.build/rollup-plugin-tailwind-in-js.cjs');
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;
const typescript = require('@rollup/plugin-typescript');
const commonjs = require('@rollup/plugin-commonjs');
const replace = require('@rollup/plugin-replace');
const json = require('@rollup/plugin-json');
const copy = require('rollup-plugin-copy');

module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  rollupConfig(config) {
    config.plugins.unshift(
      copy({ targets: [{ src: 'src/static/*', dest: 'storybook-static' }] }),
      nodeResolve({ browser: true }),
      tailwindInJs({ config: tailwindConfig, extensions: ['.ts'] }),
      typescript({ outDir: 'storybook-static' }),
      commonjs(),
      json(),
      replace({
        'process.env.NODE_ENV': '"production"',
        'process.env.FOXY_CDN': '"https://static.www.foxycart.com/beta/foxy-elements/0.3.0"',
      })
    );

    return config;
  },
};
