const libToES = m => m.replace('lib', 'es');

module.exports = {
  transform({ body }) {
    return { body: body.replace(/xstate\/.*\/?(lib)/gi, libToES) };
  },
};
