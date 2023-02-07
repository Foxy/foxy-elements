import { readdir, readFile, writeFile } from 'fs/promises';

const internalElementsURL = new URL('../src/elements/internal', import.meta.url);
const privateElementsURL = new URL('../src/elements/private', import.meta.url);
const publicElementsURL = new URL('../src/elements/public', import.meta.url);

const internalElements = await readdir(internalElementsURL, { withFileTypes: true });
const privateElements = await readdir(privateElementsURL, { withFileTypes: true });
const publicElements = await readdir(publicElementsURL, { withFileTypes: true });

const groups = [];

internalElements.forEach(file => {
  if (file.isDirectory()) {
    groups.push({
      name: `foxy-${file.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`,
      files: `./src/elements/internal/${file.name}/**/*.test.ts`,
    });
  }
});

privateElements.forEach(file => {
  if (file.isDirectory()) {
    groups.push({
      name: `x-${file.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`,
      files: `./src/elements/private/${file.name}/**/*.test.ts`,
    });
  }
});

publicElements.forEach(file => {
  if (file.isDirectory()) {
    groups.push({
      name: `foxy-${file.name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`,
      files: `./src/elements/public/${file.name}/**/*.test.ts`,
    });
  }
});

const configURL = new URL('../web-test-runner.groups.js', import.meta.url);
const config = `export const groups = ${JSON.stringify(groups, null, 2)}`;

await writeFile(configURL, config, { encoding: 'utf-8' });
