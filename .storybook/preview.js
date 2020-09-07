import { addParameters, setCustomElements } from '@open-wc/demoing-storybook';

addParameters({ docs: { iframeHeight: '200px' } });

(async () => {
  const base = import.meta.url;
  const customElements = await fetch(new URL('../custom-elements.json', base).toString());
  const customElementsJSON = await customElements.json();

  setCustomElements(customElementsJSON);
})();
