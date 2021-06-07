import { expect, fixture, html } from '@open-wc/testing';

import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { CustomFieldElement } from '@vaadin/vaadin-custom-field';
import { FrequencyInput } from './FrequencyInput';
import { IntegerFieldElement } from '@vaadin/vaadin-text-field/vaadin-integer-field';

customElements.define('x-frequency-input', FrequencyInput);

describe('FrequencyInput', () => {
  it('renders empty by default', async () => {
    const template = html`<x-frequency-input></x-frequency-input>`;
    const element = await fixture<FrequencyInput>(template);
    const root = element.renderRoot;

    expect(element).to.have.property('label', '');
    expect(element).to.have.property('value', '');
    expect(element).not.to.have.attribute('disabled');
    expect(element).not.to.have.attribute('readonly');
    expect(element).to.have.property('errorMessage', '');
    expect(element.checkValidity(), 'must be valid by default').to.be.true;

    const field = root.querySelector('[data-testid="field"]') as CustomFieldElement;
    const value = root.querySelector('[data-testid="value"]') as IntegerFieldElement;
    const units = root.querySelector('[data-testid="units"]') as ComboBoxElement;

    expect(field).to.have.property('label', '');
    expect(field).to.have.property('value', '');
    expect(field).not.to.have.attribute('disabled');
    expect(field).not.to.have.attribute('readonly');
    expect(field).to.have.property('errorMessage', '');
    expect(field.checkValidity(), 'must be valid by default').to.be.true;

    expect(value).to.have.property('invalid', false);
    expect(units).to.have.property('invalid', false);
  });

  it('supports custom label', async () => {
    const template = html`<x-frequency-input label="foo"></x-frequency-input>`;
    const element = await fixture<FrequencyInput>(template);
    const root = element.renderRoot;
    const field = root.querySelector('[data-testid="field"]') as CustomFieldElement;

    expect(element).to.have.property('label', 'foo');
    expect(field).to.have.property('label', 'foo');
  });

  it('supports custom value', async () => {
    const template = html`<x-frequency-input value="1d"></x-frequency-input>`;
    const element = await fixture<FrequencyInput>(template);
    const root = element.renderRoot;
    const field = root.querySelector('[data-testid="field"]') as CustomFieldElement;

    expect(element).to.have.property('value', '1d');
    expect(field).to.have.property('value', '1d');
  });

  it('can be disabled', async () => {
    const template = html`<x-frequency-input disabled></x-frequency-input>`;
    const element = await fixture<FrequencyInput>(template);
    const root = element.renderRoot;
    const field = root.querySelector('[data-testid="field"]') as CustomFieldElement;

    expect(element).to.have.attribute('disabled');
    expect(field).to.have.attribute('disabled');
  });

  it('can be readonly', async () => {
    const template = html`<x-frequency-input readonly></x-frequency-input>`;
    const element = await fixture<FrequencyInput>(template);
    const root = element.renderRoot;
    const field = root.querySelector('[data-testid="field"]') as CustomFieldElement;

    expect(element).to.have.attribute('readonly');
    expect(field).to.have.attribute('readonly');
  });

  it('can have custom error message', async () => {
    const template = html`<x-frequency-input error-message="foo"></x-frequency-input>`;
    const element = await fixture<FrequencyInput>(template);
    const root = element.renderRoot;
    const field = root.querySelector('[data-testid="field"]') as CustomFieldElement;

    expect(element).to.have.property('errorMessage', 'foo');
    expect(field).to.have.property('errorMessage', 'foo');
  });

  it('can have custom validity', async () => {
    const v8n = () => false;
    const template = html`<x-frequency-input .checkValidity=${v8n}></x-frequency-input>`;
    const element = await fixture<FrequencyInput>(template);
    const root = element.renderRoot;
    const field = root.querySelector('[data-testid="field"]') as CustomFieldElement;
    const value = root.querySelector('[data-testid="value"]') as IntegerFieldElement;
    const units = root.querySelector('[data-testid="units"]') as ComboBoxElement;

    expect(element).to.have.property('checkValidity', v8n);
    expect(field).to.have.property('checkValidity', v8n);
    expect(value).to.have.property('invalid', true);
    expect(units).to.have.property('invalid', true);
  });
});
