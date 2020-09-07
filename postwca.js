/* eslint-disable @typescript-eslint/no-var-requires */

(async () => {
  console.log('[postwca]: running post-processing on custom-elements.json');

  const { promises: fs } = require('fs');
  const path = 'custom-elements.json';
  const json = JSON.parse((await fs.readFile(path)).toString());
  const types = new Set(['object', 'boolean', 'string', 'number']);
  const cssProperties = require('./custom-properties.json');

  console.log('[postwca]: adding property and attribute knobs');

  json.tags.forEach(tag => {
    tag.cssProperties = cssProperties;
    ['attributes', 'properties'].forEach(kind => {
      tag[kind].forEach(attribute => {
        attribute.storybookKnobs = {
          type: types.has(attribute.type) ? attribute.type : 'object',
        };
      });
    });
  });

  console.log('[postwca]: writing to disk');

  await fs.writeFile(path, JSON.stringify(json, null, 2));

  console.log('[postwca]: done');
})();
