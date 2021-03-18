module.exports = async function (source, map, meta) {
  const resolve = this.async();

  try {
    const tailwindcss = require('tailwindcss')(
      Object.assign({}, require('../tailwind.config.js'), {
        purge: {
          enabled: true,
          content: ['./src/**/*.ts'],
          options: {
            whitelistPatterns: [/:host/],
          },
        },
      })
    );

    const autoprefixer = require('autoprefixer');
    const cssnano = require('cssnano');
    const postcss = require('postcss');
    const path = require('path');
    const { promises: fs } = require('fs');

    const from = path.join(__dirname, '../tailwind.css');
    const escape = v => v.replace(/\\/gi, '\\\\').replace(/`/gi, '\\`');
    const plugins = [tailwindcss, autoprefixer, cssnano];
    const tailwindBuild = await postcss(plugins).process(await fs.readFile(from), { from });
    const result = source.replace('{{ output }}', escape(tailwindBuild.css));

    resolve(null, result, map, meta);
  } catch (err) {
    resolve(err, source, map, meta);
  }
};
