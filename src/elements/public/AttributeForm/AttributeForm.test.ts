import { expect } from '@open-wc/testing';
import { AttributeFormElement } from './index';

describe('AttributeForm', () => {
  it('registers a custom element in global registry', () => {
    expect(customElements.get('foxy-attribute-form')).to.equal(AttributeFormElement);
  });
});
