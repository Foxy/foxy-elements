import { BooleanSelector } from '@foxy.io/sdk/core';
import { directive, AttributePart } from 'lit-html';

export const booleanSelectorOf = directive(
  (rootSelector: BooleanSelector, ...zoom: string[]) => (part: AttributePart) => {
    const finalSelector = zoom.reduce((selector, id) => selector.zoom(id), rootSelector);
    const attributeValue = finalSelector.toAttribute();

    if (typeof attributeValue === 'string') {
      part.setValue(attributeValue);
    } else {
      const { element, name } = part.committer;
      element.removeAttribute(name);
    }
  }
);
