import webServerConfig from './web-dev-server.config.js';

export default Object.assign({}, webServerConfig, {
  browserLogs: false,
  testsFinishTimeout: 240000, // 4 minutes

  testFramework: {
    config: {
      timeout: '10000',
    },
  },

  middleware: [
    (context, next) => {
      const url = context.url;
      const prefix = '/src/mocks';
      if (url.startsWith('/translations')) context.url = `${prefix}${url}`;
      return next();
    },
  ],
});
