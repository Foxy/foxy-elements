import { expect, fixture } from '@open-wc/testing';

import { PropertyTableElement } from './PropertyTable';
import { html } from 'lit-html';

customElements.define('x-property-table', PropertyTableElement);

describe('PropertyTable', () => {
  it('has empty items by default', () => {
    const element = new PropertyTableElement();
    expect(element).to.have.deep.property('items', []);
  });

  it('has false disabled property by default', () => {
    const element = new PropertyTableElement();
    expect(element).to.have.property('disabled', false);
  });

  it('reflects disabled property to attribute', async () => {
    const template = html`<x-property-table></x-property-table>`;
    const element = await fixture<PropertyTableElement>(template);

    element.disabled = true;
    await element.updateComplete;

    expect(element).to.have.attribute('disabled');
  });

  it('does not reflect items property to attribute', async () => {
    const template = html`<x-property-table></x-property-table>`;
    const element = await fixture<PropertyTableElement>(template);

    element.items = [{ value: 'foo', name: 'bar' }];
    await element.updateComplete;

    expect(element).to.not.have.attribute('items');
  });

  it('renders empty table by default', async () => {
    const template = html`<x-property-table></x-property-table>`;
    const element = await fixture<PropertyTableElement>(template);
    const table = element.renderRoot.querySelector('table') as HTMLTableElement;

    expect(table.rows).to.be.empty;
  });

  it('renders enabled table based on provided items', async () => {
    const template = html`<x-property-table></x-property-table>`;
    const element = await fixture<PropertyTableElement>(template);
    const items = [{ value: 'foo', name: 'bar' }];
    const table = element.renderRoot.querySelector('table') as HTMLTableElement;

    element.items = items;
    await element.updateComplete;

    items.forEach((item, index) => {
      const [nameCell, valueCell] = table.rows[index].cells;

      expect(nameCell).to.contain.text(item.name);
      expect(nameCell).to.have.attribute('title', item.name);
      expect(nameCell).to.have.class('text-secondary');

      expect(valueCell).to.contain.text(item.value);
      expect(valueCell).to.have.attribute('title', item.value);
      expect(valueCell).to.have.class('text-body');
    });
  });

  it('renders disabled table based on provided items', async () => {
    const template = html`<x-property-table></x-property-table>`;
    const element = await fixture<PropertyTableElement>(template);
    const items = [{ value: 'foo', name: 'bar' }];
    const table = element.renderRoot.querySelector('table') as HTMLTableElement;

    element.disabled = true;
    element.items = items;
    await element.updateComplete;

    items.forEach((item, index) => {
      const [nameCell, valueCell] = table.rows[index].cells;

      expect(nameCell).to.contain.text(item.name);
      expect(nameCell).to.have.attribute('title', item.name);
      expect(nameCell).to.have.class('text-disabled');

      expect(valueCell).to.contain.text(item.value);
      expect(valueCell).to.have.attribute('title', item.value);
      expect(valueCell).to.have.class('text-disabled');
    });
  });
});
