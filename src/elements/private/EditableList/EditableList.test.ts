import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { LitElement } from 'lit-element';
import { EditableList } from './EditableList';

customElements.define('test-editable-list', EditableList);

describe('EditableList', () => {
  it('extends LitElement', () => {
    expect(new EditableList()).to.be.instanceOf(LitElement);
  });

  it('has an empty i18n namespace by default', () => {
    expect(new EditableList()).to.have.property('ns', '');
  });

  it('has an empty options list by default', () => {
    expect(EditableList).to.have.nested.property('properties.options');
    expect(new EditableList()).to.have.deep.property('options', []);
  });

  it('has an empty items list by default', () => {
    expect(EditableList).to.have.nested.property('properties.items');
    expect(new EditableList()).to.have.deep.property('items', []);
  });

  it('renders basic items', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);

    element.items = [{ value: 'foo' }, { value: 'bar' }];
    await element.updateComplete;

    const list = element.renderRoot.querySelector('ol') as HTMLOListElement;
    const items = [...list.children] as HTMLLIElement[];

    expect(items.length).to.equal(2);
    expect(items[0]).to.include.text('foo');
    expect(items[1]).to.include.text('bar');
  });

  it('renders items with custom text labels', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);

    element.items = [
      { value: '0', label: 'foo' },
      { value: '1', label: 'bar' },
    ];

    await element.updateComplete;

    const list = element.renderRoot.querySelector('ol') as HTMLOListElement;
    const items = [...list.children] as HTMLLIElement[];

    expect(items.length).to.equal(2);
    expect(items[0]).to.include.text('foo');
    expect(items[1]).to.include.text('bar');
  });

  it('renders items with custom template labels', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);

    element.items = [
      { value: '0', label: html`<div>foo</div>` },
      { value: '1', label: html`<div>bar</div>` },
    ];

    await element.updateComplete;

    const list = element.renderRoot.querySelector('ol') as HTMLOListElement;
    const items = [...list.children] as HTMLLIElement[];

    expect(items.length).to.equal(2);
    expect(items[0]).to.include.html('<div>foo</div>');
    expect(items[1]).to.include.html('<div>bar</div>');
  });

  it('can delete items', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);

    element.items = [{ value: '0' }, { value: '1' }];
    await element.updateComplete;

    const whenChangeEmitted = oneEvent(element, 'change');
    const list = element.renderRoot.querySelector('ol') as HTMLOListElement;
    const items = [...list.children] as HTMLLIElement[];
    items[0].querySelector<HTMLButtonElement>('button[aria-label="delete"]')?.click();

    expect(element).to.have.deep.property('items', [{ value: '1' }]);
    expect(await whenChangeEmitted).to.be.instanceOf(CustomEvent);
  });

  it('can add items on Enter', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;
    const whenChangeEmitted = oneEvent(element, 'change');

    input.value = 'foo';
    input.dispatchEvent(new InputEvent('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(await whenChangeEmitted).to.be.instanceOf(CustomEvent);
    expect(element).to.have.deep.property('items', [{ value: 'foo' }]);
  });

  it('can add items on Submit button click', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;
    const whenChangeEmitted = oneEvent(element, 'change');

    input.value = 'foo';
    input.dispatchEvent(new InputEvent('input'));
    await element.updateComplete;
    element.renderRoot.querySelector<HTMLElement>('button[aria-label="submit"]')?.click();

    expect(await whenChangeEmitted).to.be.instanceOf(CustomEvent);
    expect(element).to.have.deep.property('items', [{ value: 'foo' }]);
  });

  it('renders basic datalist if options are provided', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);

    element.options = [{ value: 'foo' }, { value: 'bar' }];
    await element.updateComplete;
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;

    expect(input).to.have.nested.property('list.options.length', 2);
    expect(input).to.have.nested.property('list.options[0].value', 'foo');
    expect(input).to.have.nested.property('list.options[1].value', 'bar');
  });

  it('renders datalist with labels if options are provided', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);

    element.options = [
      { value: '0', label: 'Foo' },
      { value: '1', label: 'Bar' },
    ];

    await element.updateComplete;
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;

    expect(input).to.have.nested.property('list.options.length', 2);
    expect(input).to.have.nested.property('list.options[0].value', '0');
    expect(input).to.have.nested.property('list.options[0].textContent', 'Foo');
    expect(input).to.have.nested.property('list.options[1].value', '1');
    expect(input).to.have.nested.property('list.options[1].textContent', 'Bar');
  });

  it('disables Submit button when input is empty', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);
    const button = element.renderRoot.querySelector('button[aria-label="submit"]');

    expect(button).to.have.attribute('disabled');
  });

  it('enables Submit button when input has text', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;

    input.value = 'Test';
    input.dispatchEvent(new InputEvent('input'));
    await element.updateComplete;

    const button = element.renderRoot.querySelector('button[aria-label="submit"]');
    expect(button).to.not.have.attribute('disabled');
  });

  it('disables buttons and input when the component is disabled', async () => {
    const layout = html`<test-editable-list></test-editable-list>`;
    const element = await fixture<EditableList>(layout);
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;

    input.value = 'Test';
    input.dispatchEvent(new InputEvent('input'));
    element.disabled = true;
    await element.updateComplete;

    const controls = element.renderRoot.querySelectorAll('button, input');
    controls.forEach(control => expect(control).to.have.attribute('disabled'));
  });
});
