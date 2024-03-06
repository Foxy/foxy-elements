import './index';

import { InternalEditableListControl as Control } from './InternalEditableListControl';
import { expect, fixture, html, oneEvent } from '@open-wc/testing';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';

describe('InternalEditableListControl', () => {
  it('imports and registers foxy-internal-editable-control element', () => {
    const element = customElements.get('foxy-internal-editable-control');
    expect(element).to.equal(InternalEditableControl);
  });

  it('imports and registers itself as foxy-internal-editable-list-control element', () => {
    const element = customElements.get('foxy-internal-editable-list-control');
    expect(element).to.equal(Control);
  });

  it('extends InternalEditableControl', () => {
    expect(new Control()).to.be.instanceOf(InternalEditableControl);
  });

  it('has a reactive property "inputParams"', () => {
    expect(Control).to.have.deep.nested.property('properties.inputParams', { attribute: false });
    expect(new Control()).to.have.deep.property('inputParams', {});
  });

  it('has a reactive property "options"', () => {
    expect(Control).to.have.deep.nested.property('properties.options', { type: Array });
    expect(new Control()).to.have.deep.property('options', []);
  });

  it('renders basic items', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);

    element.getValue = () => [{ value: 'foo' }, { value: 'bar' }];
    await element.requestUpdate();

    const list = element.renderRoot.querySelector('ol') as HTMLOListElement;
    const items = [...list.children] as HTMLLIElement[];

    expect(items.length).to.equal(2);
    expect(items[0]).to.include.text('foo');
    expect(items[1]).to.include.text('bar');
  });

  it('renders items with custom text labels', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);

    element.getValue = () => [
      { value: '0', label: 'foo' },
      { value: '1', label: 'bar' },
    ];

    await element.requestUpdate();

    const list = element.renderRoot.querySelector('ol') as HTMLOListElement;
    const items = [...list.children] as HTMLLIElement[];

    expect(items.length).to.equal(2);
    expect(items[0]).to.include.text('foo');
    expect(items[1]).to.include.text('bar');
  });

  it('renders items with custom template labels', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);

    element.getValue = () => [
      { value: '0', label: html`<div>foo</div>` },
      { value: '1', label: html`<div>bar</div>` },
    ];

    await element.requestUpdate();

    const list = element.renderRoot.querySelector('ol') as HTMLOListElement;
    const items = [...list.children] as HTMLLIElement[];

    expect(items.length).to.equal(2);
    expect(items[0]).to.include.html('<div>foo</div>');
    expect(items[1]).to.include.html('<div>bar</div>');
  });

  it('can delete items', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);

    let value: unknown = [{ value: '0' }, { value: '1' }];
    element.getValue = () => value;
    element.setValue = newValue => (value = newValue);
    await element.requestUpdate();

    const whenChangeEmitted = oneEvent(element, 'change');
    const list = element.renderRoot.querySelector('ol') as HTMLOListElement;
    const items = [...list.children] as HTMLLIElement[];
    items[0].querySelector<HTMLButtonElement>('button[aria-label="delete"]')?.click();

    expect(value).to.deep.equal([{ value: '1' }]);
    expect(await whenChangeEmitted).to.be.instanceOf(CustomEvent);
  });

  it('can add items on Enter', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);

    let value: unknown = [];
    element.getValue = () => value;
    element.setValue = newValue => (value = newValue);
    await element.requestUpdate();

    const input = element.renderRoot.querySelector('input') as HTMLInputElement;
    const whenChangeEmitted = oneEvent(element, 'change');

    input.value = 'foo';
    input.dispatchEvent(new InputEvent('input'));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(await whenChangeEmitted).to.be.instanceOf(CustomEvent);
    expect(value).to.deep.equal([{ value: 'foo' }]);
  });

  it('can add items on Submit button click', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);

    let value: unknown = [];
    element.getValue = () => value;
    element.setValue = newValue => (value = newValue);
    await element.requestUpdate();

    const input = element.renderRoot.querySelector('input') as HTMLInputElement;
    const whenChangeEmitted = oneEvent(element, 'change');

    input.value = 'foo';
    input.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();
    element.renderRoot.querySelector<HTMLElement>('button[aria-label="submit"]')?.click();

    expect(await whenChangeEmitted).to.be.instanceOf(CustomEvent);
    expect(value).to.deep.equal([{ value: 'foo' }]);
  });

  it('renders basic datalist if options are provided', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);

    element.options = [{ value: 'foo' }, { value: 'bar' }];
    await element.requestUpdate();
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;

    expect(input).to.have.nested.property('list.options.length', 2);
    expect(input).to.have.nested.property('list.options[0].value', 'foo');
    expect(input).to.have.nested.property('list.options[1].value', 'bar');
  });

  it('renders datalist with labels if options are provided', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);

    element.options = [
      { value: '0', label: 'Foo' },
      { value: '1', label: 'Bar' },
    ];

    await element.requestUpdate();
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;

    expect(input).to.have.nested.property('list.options.length', 2);
    expect(input).to.have.nested.property('list.options[0].value', '0');
    expect(input).to.have.nested.property('list.options[0].textContent', 'Foo');
    expect(input).to.have.nested.property('list.options[1].value', '1');
    expect(input).to.have.nested.property('list.options[1].textContent', 'Bar');
  });

  it('passes params from .inputParams to input element', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;

    expect(input).to.not.have.attribute('data-test');

    element.inputParams = { 'data-test': 'foo' };
    await element.requestUpdate();

    expect(input).to.have.attribute('data-test', 'foo');
  });

  it('disables Submit button when input is empty', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);
    const button = element.renderRoot.querySelector('button[aria-label="submit"]');

    expect(button).to.have.attribute('disabled');
  });

  it('enables Submit button when input has text', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;

    input.value = 'Test';
    input.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();

    const button = element.renderRoot.querySelector('button[aria-label="submit"]');
    expect(button).to.not.have.attribute('disabled');
  });

  it('disables buttons and input when the component is disabled', async () => {
    const layout = html`<foxy-internal-editable-list-control></foxy-internal-editable-list-control>`;
    const element = await fixture<Control>(layout);
    const input = element.renderRoot.querySelector('input') as HTMLInputElement;

    input.value = 'Test';
    input.dispatchEvent(new InputEvent('input'));
    element.disabled = true;
    await element.requestUpdate();

    const controls = element.renderRoot.querySelectorAll('button, input');
    controls.forEach(control => expect(control).to.have.attribute('disabled'));
  });
});
