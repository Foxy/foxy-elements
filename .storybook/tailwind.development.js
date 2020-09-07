module.exports = async function (source, map, meta) {
  const resolve = this.async();

  try {
    const tailwindconfig = require('../tailwind.config.js');
    const tailwindcss = require('tailwindcss')(tailwindconfig);
    const postcss = require('postcss');
    const path = require('path');
    const { promises: fs } = require('fs');

    const escape = v => v.replace(/\\/gi, '\\\\').replace(/`/gi, '\\`');
    const plugins = [tailwindcss];
    const from = path.join(__dirname, '../tailwind.css');
    const tailwindBuild = await postcss(plugins).process(await fs.readFile(from), { from });
    const result = source.replace('{{ output }}', escape(tailwindBuild.css));

    resolve(null, result, map, meta);
  } catch (err) {
    resolve(err, source, map, meta);
  }
};
