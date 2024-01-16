import { expect, fixture } from '@open-wc/testing';

import { Metadata } from './Metadata';
import { html } from 'lit-html';

customElements.define('x-metadata', Metadata);

describe('Metadata', () => {
  it('has empty items by default', () => {
    const element = new Metadata();
    expect(element).to.have.deep.property('items', []);
  });

  it('does not reflect items property to attribute', async () => {
    const template = html`<x-metadata></x-metadata>`;
    const element = await fixture<Metadata>(template);

    element.items = [{ value: 'foo', name: 'bar' }];
    await element.requestUpdate();

    expect(element).to.not.have.attribute('items');
  });

  it('renders empty text by default', async () => {
    const template = html`<x-metadata></x-metadata>`;
    const element = await fixture<Metadata>(template);
    const p = element.renderRoot.querySelector('p') as HTMLParagraphElement;

    expect(p.children).to.be.empty;
  });

  it('renders props based on provided items', async () => {
    const template = html`<x-metadata></x-metadata>`;
    const element = await fixture<Metadata>(template);
    const items = [{ value: 'foo', name: 'bar' }];
    const p = element.renderRoot.querySelector('p') as HTMLParagraphElement;

    element.items = items;
    await element.requestUpdate();

    items.forEach(item => {
      expect(p).to.contain.text(`${item.name} ${item.value}`);
    });
  });
});
