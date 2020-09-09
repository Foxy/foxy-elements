module.exports = {
  transform({ body }) {
    return { body: body.replace('import jsonata from', 'import') };
  },
};
