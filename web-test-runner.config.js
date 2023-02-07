import { puppeteerLauncher } from '@web/test-runner-puppeteer';
import { groups } from './web-test-runner.groups.js';

import webServerConfig from './web-dev-server.config.js';

export default Object.assign({}, webServerConfig, {
  browserLogs: false,

  browsers: [puppeteerLauncher()],

  groups,

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
