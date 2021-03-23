import webServerConfig from './web-dev-server.config';

export default Object.assign({}, webServerConfig, {
  concurrency: 1, // can't run tests concurrently as long as we use indexeddb for mock api

  middleware: [
    (context, next) => {
      const url = context.url;
      const prefix = '/src/mocks';
      if (url.startsWith('/translations')) context.url = `${prefix}${url}`;
      return next();
    },
  ],
});
