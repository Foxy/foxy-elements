/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
  port: 8080,
  watch: true,
  nodeResolve: true,
  appIndex: 'index.html',
  moduleDirs: ['node_modules'],
  plugins: [
    require('./plugins/set-node-env')('development'),
    require('./plugins/fix-xstate-chalk-imports'),
    require('./plugins/use-es-version-of-xstate'),
    require('./plugins/fix-jsonata-import'),
    require('./plugins/tailwind'),
  ],
};
