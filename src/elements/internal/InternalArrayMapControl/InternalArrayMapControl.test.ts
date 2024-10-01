import './index';

import { InternalArrayMapControl as Control } from './InternalArrayMapControl';
import { expect, fixture, html } from '@open-wc/testing';

describe('InternalArrayMapControl', () => {
  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines foxy-internal-editable-control element', () => {
    expect(customElements.get('foxy-internal-editable-control')).to.exist;
  });

  it('defines itself as foxy-internal-array-map-control', () => {
    expect(customElements.get('foxy-internal-array-map-control')).to.equal(Control);
  });

  it('extends foxy-internal-editable-control', () => {
    expect(new Control()).to.be.instanceOf(customElements.get('foxy-internal-editable-control'));
  });

  it('renders a single empty rule by default', async () => {
    const element = await fixture<Control>(
      html`<foxy-internal-array-map-control></foxy-internal-array-map-control>`
    );

    const rules = element.renderRoot.querySelectorAll('[aria-label="rule"]');
    const keyInput = rules?.[0]?.querySelector('input');

    expect(rules).to.have.length(1);
    expect(keyInput).to.exist;
    expect(keyInput).to.have.value('');
    expect(keyInput?.labels?.[0].textContent?.trim()).to.equal('option_name');
  });

  it('adds a rule once user starts typing into the key field', async () => {
    let value: Record<string, string[]> = {};

    const element = await fixture<Control>(
      html`
        <foxy-internal-array-map-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[]>) => (value = newValue)}
        >
        </foxy-internal-array-map-control>
      `
    );

    const root = element.renderRoot;
    expect(root.querySelectorAll(`[aria-label="rule"]`)).to.have.length(1);

    const path = root.querySelector('[aria-label="rule"] input') as HTMLInputElement;
    path.value = 'a';
    path.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();

    expect(root.querySelectorAll(`[aria-label="rule"]`)).to.have.length(2);
    expect(value).to.deep.equal({ a: [] });
  });

  it('clears path of the last rule after adding a new one', async () => {
    let value: Record<string, string[]> = {};

    const element = await fixture<Control>(
      html`
        <foxy-internal-array-map-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[]>) => (value = newValue)}
        >
        </foxy-internal-array-map-control>
      `
    );

    const root = element.renderRoot;
    const path = root.querySelector('[aria-label="rule"] input') as HTMLInputElement;

    path.value = 'a';
    path.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();

    expect(root.querySelector('[aria-label="rule"]:last-of-type input')).to.have.value('');
  });

  it('updates element value once rule field changes', async () => {
    let value: Record<string, string[]> = { foo: ['one', 'two'] };

    const element = await fixture<Control>(
      html`
        <foxy-internal-array-map-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[]>) => (value = newValue)}
        >
        </foxy-internal-array-map-control>
      `
    );

    const valueInput = element.renderRoot.querySelector('input') as HTMLInputElement;
    valueInput.value = 'bar';
    valueInput.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();

    expect(value).to.deep.equal({ bar: ['one', 'two'] });
  });

  it('renders editable list of values for each key', async () => {
    let value: Record<string, string[]> = { foo: ['bar', 'baz'] };

    const element = await fixture<Control>(
      html`
        <foxy-internal-array-map-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[]>) => (value = newValue)}
        >
        </foxy-internal-array-map-control>
      `
    );

    const root = element.renderRoot;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [path, first, second, addNew] = [...root.querySelectorAll<HTMLInputElement>('input')];
    expect(first).to.have.property('value', 'bar');
    expect(second).to.have.property('value', 'baz');

    first.value = 'qux';
    first.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();
    expect(value).to.deep.equal({ foo: ['qux', 'baz'] });

    second.value = 'abc';
    second.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();
    expect(value).to.deep.equal({ foo: ['qux', 'abc'] });

    addNew.value = 'def';
    addNew.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();
    expect(value).to.deep.equal({ foo: ['qux', 'abc', 'def'] });

    addNew.value = '';
    addNew.dispatchEvent(new InputEvent('input'));
    await element.requestUpdate();
    expect(value).to.deep.equal({ foo: ['qux', 'abc'] });
  });

  it('disables all inputs in the render root when disabled', async () => {
    let value: Record<string, string[]> = { foo: ['bar', 'baz'] };

    const element = await fixture<Control>(
      html`
        <foxy-internal-array-map-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[]>) => (value = newValue)}
        >
        </foxy-internal-array-map-control>
      `
    );

    const root = element.renderRoot;
    const controls = root.querySelectorAll('input');
    controls.forEach(control => expect(control).to.not.have.attribute('disabled'));

    element.disabled = true;
    await element.requestUpdate();
    controls.forEach(control => expect(control).to.have.attribute('disabled'));
  });

  it('disables all inputs in the render root when readonly', async () => {
    let value: Record<string, string[]> = { foo: ['bar', 'baz'] };

    const element = await fixture<Control>(
      html`
        <foxy-internal-array-map-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[]>) => (value = newValue)}
        >
        </foxy-internal-array-map-control>
      `
    );

    const root = element.renderRoot;
    let controls = root.querySelectorAll('input');
    controls.forEach(control => expect(control).to.not.have.attribute('disabled'));

    element.readonly = true;
    await element.requestUpdate();
    controls = root.querySelectorAll('input');
    controls.forEach(control => expect(control).to.have.attribute('disabled'));
  });

  it('deletes a rule when remove button is clicked', async () => {
    let value: Record<string, string[]> = { foo: ['bar', 'baz'], qux: ['abc'] };

    const element = await fixture<Control>(
      html`
        <foxy-internal-array-map-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[]>) => (value = newValue)}
        >
        </foxy-internal-array-map-control>
      `
    );

    const root = element.renderRoot;
    const removeButton = root.querySelector('button[aria-label="delete"]') as HTMLButtonElement;
    removeButton.click();

    expect(value).to.deep.equal({ qux: ['abc'] });
  });

  it('deletes a rule when Backspace is pressed on an empty key field', async () => {
    let value: Record<string, string[]> = { foo: ['bar', 'baz'], qux: ['abc'] };

    const element = await fixture<Control>(
      html`
        <foxy-internal-array-map-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[]>) => (value = newValue)}
        >
        </foxy-internal-array-map-control>
      `
    );

    const root = element.renderRoot;
    const keyInput = root.querySelector('input') as HTMLInputElement;
    keyInput.value = '';
    keyInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace' }));

    expect(value).to.deep.equal({ qux: ['abc'] });
  });

  it('deletes an option when value field is cleared', async () => {
    let value: Record<string, string[]> = { foo: ['bar', 'baz'], qux: ['abc'] };

    const element = await fixture<Control>(
      html`
        <foxy-internal-array-map-control
          .getValue=${() => value}
          .setValue=${(newValue: Record<string, string[]>) => (value = newValue)}
        >
        </foxy-internal-array-map-control>
      `
    );

    const root = element.renderRoot;
    const inputs = root.querySelectorAll('input');
    inputs[2].value = '';
    inputs[2].dispatchEvent(new InputEvent('input'));

    expect(value).to.deep.equal({ foo: ['bar'], qux: ['abc'] });
  });
});
