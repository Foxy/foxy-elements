/* eslint-disable @typescript-eslint/no-var-requires */

const tailwind = {
  async transform(context) {
    if (!context.path.endsWith('themeable.js')) return;

    const tailwindconfig = require('./tailwind.config.js');
    const tailwindcss = require('tailwindcss')(tailwindconfig);
    const postcss = require('postcss');
    const { promises: fs } = require('fs');

    const escape = v => v.replace(/\\/gi, '\\\\').replace(/`/gi, '\\`');
    const plugins = [tailwindcss];
    const tailwindBuild = await postcss(plugins).process(
      await fs.readFile('tailwind.css'),
      { from: 'tailwind.css' }
    );

    return {
      body: context.body.replace('{{ output }}', escape(tailwindBuild.css)),
    };
  },
};

module.exports = {
  port: 8080,
  watch: true,
  nodeResolve: true,
  appIndex: 'index.html',
  plugins: [tailwind],
  moduleDirs: ['node_modules'],
};
