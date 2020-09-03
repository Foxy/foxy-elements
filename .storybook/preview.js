import { addParameters, setCustomElements } from '@open-wc/demoing-storybook';

addParameters({ docs: { iframeHeight: '200px' } });

(async function() {
  function getCustomPropertyNames() {
    function isStyleRule(rule) {
      return rule.type === CSSRule.STYLE_RULE;
    }

    function isSameDomain(styleSheet) {
      if (!styleSheet.href) return true;
      return styleSheet.href.indexOf(window.location.origin) === 0;
    }

    function isCustomProperty(property) {
      return property.startsWith('--');
    }

    function ruleToNames(previous, current) {
      const currentValues = [...current.style].map((name) => name.trim()).filter(isCustomProperty);
      return [...previous, ...currentValues];
    }

    function stylesheetToNames(previous, current) {
      const props = [...current.cssRules].filter(isStyleRule).reduce(ruleToNames, []);
      return [...previous, ...props];
    }

    return Array
        .from(document.styleSheets)
        .filter(isSameDomain)
        .reduce(stylesheetToNames, []);
  }

  function isLumoProperty(name) {
    return name.startsWith('--lumo-') && !name.includes('-icons-');
  }

  function isColorProperty(name) {
    return ["color", "success", "primary", "shade", "error", "tint"].some(v => name.includes(v));
  }

  function toKnob(name) {
    const storybookKnobs = { type: isColorProperty(name) ? 'color' : 'string' };
    return { storybookKnobs, name };
  }

  const base = import.meta.url;
  const customElements = await fetch(new URL('../custom-elements.json', base).toString());
  const customElementsJSON = await customElements.json();
  const lumoProperties = getCustomPropertyNames().filter(isLumoProperty).map(toKnob);

  customElementsJSON.tags.forEach(tag => {
    const existingProperties = tag.cssProperties ?? [];
    tag.cssProperties = [...existingProperties, ...lumoProperties];
  });

  setCustomElements(customElementsJSON);
})();
