const discardComments = require('postcss-discard-comments');
const discardEmpty = require('postcss-discard-empty');
const tailwindcss = require('tailwindcss');
const postcss = require('postcss');
const syntax = require('@stylelint/postcss-css-in-js');

module.exports = ({ config, extensions = [] }) => ({
  name: 'rollup-plugin-tailwind-in-js',
  async transform(code, id) {
    if (extensions.every(extension => !id.endsWith(extension))) return null;

    const plugins = [tailwindcss(config), discardComments(), discardEmpty()];
    const output = await postcss(plugins).process(code, { syntax, from: id });

    return {
      code: output.content,
      map: output.map,
    };
  },
});
