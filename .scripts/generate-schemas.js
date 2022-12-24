import { readdir, readFile, writeFile } from 'fs/promises';

async function updateVSCodeSettings(namespaces) {
  const settingsURL = new URL('../.vscode/settings.json', import.meta.url);
  const settings = await readFile(settingsURL, { encoding: 'utf-8' });
  const parsedSettings = JSON.parse(settings);

  parsedSettings['json.schemas'] = namespaces.map(ns => ({
    fileMatch: [`/src/static/translations/${ns}/*.json`],
    url: `./src/static/schemas/${ns}.json`,
  }));

  await writeFile(settingsURL, JSON.stringify(parsedSettings), { encoding: 'utf-8' });
}

async function writeSchemaForNs(ns) {
  const generateNestedSchema = translations => {
    const properties = generateProperties(translations);
    return {
      additionalProperties: false,
      properties: properties,
      required: Array.from(Object.keys(properties)),
    };
  };

  const generateProperties = translations => {
    return Object.fromEntries(
      Object.entries(translations).map(([key, value]) => {
        if (typeof value === 'object') return [key, generateNestedSchema(value)];
        return [key, { type: 'string', default: value }];
      })
    );
  };

  const enTranslationURL = new URL(`../src/static/translations/${ns}/en.json`, import.meta.url);
  const enTranslation = await readFile(enTranslationURL, { encoding: 'utf-8' });
  const schema = JSON.stringify({
    $schema: 'http://json-schema.org/draft-07/schema',
    ...generateNestedSchema(JSON.parse(enTranslation)),
  });

  const schemaURL = new URL(`../src/static/schemas/${ns}.json`, import.meta.url);
  await writeFile(schemaURL, schema, { encoding: 'utf-8' });
}

const translationFilesURL = new URL('../src/static/translations', import.meta.url);
const translationFiles = await readdir(translationFilesURL, { withFileTypes: true });
const namespaces = translationFiles
  .filter(file => file.isDirectory && !file.name.startsWith('.'))
  .map(file => file.name);

await Promise.all(namespaces.map(ns => writeSchemaForNs(ns)));
await updateVSCodeSettings(namespaces);
