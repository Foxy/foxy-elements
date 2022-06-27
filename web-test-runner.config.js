import { puppeteerLauncher } from '@web/test-runner-puppeteer';
import webServerConfig from './web-dev-server.config.js';

export default Object.assign({}, webServerConfig, {
  browserLogs: false,

  browsers: [puppeteerLauncher()],

  testsFinishTimeout: 600000, // 10 minutes

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
