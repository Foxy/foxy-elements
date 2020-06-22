/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const autoprefixer = require('autoprefixer');
const tailwindcss = require('tailwindcss');
const postcss = require('postcss');
const cssnano = require('cssnano');
const fs = require('fs');

console.log('[tailwindcss]: build started');
console.log('[tailwindcss]: reading tailwind.css');

fs.readFile('tailwind.css', async (err, css) => {
  console.log('[tailwindcss]: running postcss');

  const result = await postcss([
    tailwindcss,
    autoprefixer,
    cssnano,
  ]).process(css, { from: 'tailwind.css' });

  console.log('[tailwindcss]: saving style export to src/common/tailwind.css');
  const escaped = result.css.replace(/\\/gi, '\\\\');

  fs.writeFile(
    'src/common/tailwind.ts',
    `import { unsafeCSS } from 'lit-element';\nexport const tailwind = unsafeCSS\`${escaped}\`;`,
    () => console.log('[tailwindcss]: build finished')
  );
});
