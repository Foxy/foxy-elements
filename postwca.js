/* eslint-disable @typescript-eslint/no-var-requires */

(async () => {
  console.log('[postwca]: running post-processing on custom-elements.json');

  const { promises: fs } = require('fs');
  const path = 'custom-elements.json';
  const json = JSON.parse((await fs.readFile(path)).toString());
  const cssProperties = require('./custom-properties.json');

  console.log('[postwca]: adding css properties');

  json.tags.forEach(tag => {
    tag.cssProperties = cssProperties;
  });

  console.log('[postwca]: writing to disk');

  await fs.writeFile(path, JSON.stringify(json, null, 2));

  console.log('[postwca]: done');
})();
