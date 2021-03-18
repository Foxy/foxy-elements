/* eslint-disable @typescript-eslint/no-var-requires */

module.exports = {
  async transform(context) {
    if (!context.path.endsWith('themeable.js')) return;

    const tailwindconfig = require('../tailwind.config.js');
    const tailwindcss = require('tailwindcss')(tailwindconfig);
    const postcss = require('postcss');
    const path = require('path');
    const { promises: fs } = require('fs');

    const escape = v => v.replace(/\\/gi, '\\\\').replace(/`/gi, '\\`');
    const plugins = [tailwindcss];
    const from = path.join(__dirname, '../tailwind.css');
    const tailwindBuild = await postcss(plugins).process(await fs.readFile(from), { from });

    return {
      body: context.body.replace('{{ output }}', escape(tailwindBuild.css)),
    };
  },
};
