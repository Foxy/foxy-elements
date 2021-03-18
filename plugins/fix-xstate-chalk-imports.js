module.exports = {
  transform({ path, body }) {
    if (path.includes('/node_modules/xstate') || path.includes('/node_modules/@xstate')) {
      return { body: body.replace(/\/slimChalk/gi, '/slimChalk.browser') };
    }
  },
};
