/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

console.log('[tailwindcss]: build started');

(async () => {
  console.log('[tailwindcss]: reading tailwind.css');

  const { promises: fs } = require('fs');
  const css = await fs.readFile('tailwind.css');

  const postcss = require('postcss');
  const cssnano = require('cssnano');
  const autoprefixer = require('autoprefixer');
  const tailwindcss = require('tailwindcss')(
    Object.assign({}, require('./tailwind.config.js'), {
      purge: {
        enabled: true,
        content: ['./src/**/*.*'],
      },
    })
  );

  console.log('[tailwindcss]: running postcss');

  const result = await postcss([
    tailwindcss,
    autoprefixer,
    cssnano,
  ]).process(css, { from: 'tailwind.css' });

  console.log('[tailwindcss]: injecting styles into ./dist');

  const escape = v => v.replace(/\\/gi, '\\\\');
  const original = await fs.readFile('./dist/src/common/tailwind.js');

  await fs.writeFile(
    './dist/src/common/tailwind.js',
    original.toString('utf-8').replace('{{ output }}', escape(result.css))
  );

  console.log('[tailwindcss]: done');
})();
