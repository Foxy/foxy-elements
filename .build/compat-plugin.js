export const compatPlugin = () => ({
  name: 'wds-plugin-compat',
  transform(context) {
    if (typeof context.body !== 'string') return;

    // @rollup/plugin-commonjs doesn't convert cross-fetch to esm correctly,
    // so we do it manually here instead
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

    // i18next-http-backend has a mix of CJS and ESM that results in an incorrect
    // output when converted automatically, so we do it ourselves
    if (context.url.endsWith('/i18next-http-backend/esm/getFetch.cjs')) {
      context.body = `export default window.fetch`;
    }

    // xstate files seem to get resolved correctly at first, but then at some
    // point CJS bundle starts to leak through – this plugin prevents that from happening
    context.body = context.body.replace(/xstate\/.*\/?(lib)/gi, m => m.replace('lib', 'es'));

    // chalk (imported by xstate) is resolved to a node build for some reason,
    // this plugin makes things right by rewriting the imports to the correct file
    context.body = context.body.replace(/\/slimChalk/gi, '/slimChalk.browser');

    return context;
  },
});
