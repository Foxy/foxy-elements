module.exports = (value = 'production') => ({
  transform({ body }) {
    return { body: body.replace('process.env.NODE_ENV', `"${value}"`) };
  },
});
