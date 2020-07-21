import { fixture, expect } from '@open-wc/testing';
import { ChooseValue } from './ChooseValue';
import { html, LitElement } from 'lit-element';

customElements.define('x-value', ChooseValue);

type OptElement = HTMLInputElement | HTMLSelectElement | undefined | null;

describe('Choose Value input', () => {
  it('Should provide a default value if no values are provided', async () => {
    const el: ChooseValue = await fixture(html`<x-value></x-value>`);
    expect(el.valueOptions.length).to.equal(3);
  });

  it('Should provide value options with radio buttons', async () => {
    const el = await fixture(html`<x-value></x-value>`);
    const radioGroup: OptElement = el.shadowRoot?.querySelector('[name="value-options"]');
    expect(radioGroup?.tagName).to.equal('VAADIN-RADIO-GROUP');
  });

  it('Should provide value options with select list', async () => {
    const el = await fixture(html`<x-value inputType="select"></x-value>`);
    const selectGroup: OptElement = el.shadowRoot?.querySelector('[name="value-options"]');
    expect(selectGroup?.tagName).to.equal('VAADIN-SELECT');
  });

  it('Should hide "other" field by default', async () => {
    const el = await fixture(html`<x-value ?askValueOther=${true}></x-value>`);
    const selectGroup: OptElement = el.shadowRoot?.querySelector('[name=other]');
    expect(selectGroup?.hidden).to.equal(true);
  });

  it('Should allow "other" option with input type radio', async () => {
    const el = await fixture(html`<x-value askValueOther></x-value>`);
    const other = el.shadowRoot?.querySelector('.other-option');
    (other as HTMLInputElement).click();
    expect(el.shadowRoot?.querySelectorAll('[name="other"]:not(hidden)').length).to.equal(1);
  });

  it('Should allow "other" option with input type select', async () => {
    const el = await fixture(html`<x-value inputType="select" askValueOther></x-value>`);
    const vselect = el.shadowRoot?.querySelector('vaadin-select');
    const textSelect = (vselect as HTMLSelectElement).shadowRoot!.querySelector(
      'vaadin-select-text-field'
    );
    (textSelect as HTMLInputElement).click();
    const over = document?.querySelector('vaadin-select-overlay');
    const content = over?.shadowRoot?.querySelector('#content');
    const other = content?.shadowRoot?.querySelector('.other-option');
    (other as HTMLInputElement).click();
    //(el as LitElement).requestUpdate();
    expect(el.shadowRoot?.querySelectorAll('[name="other"]:not(hidden)').length).to.equal(1);
  });

  it('Should emit event upon change', async () => {
    expect(true).to.equal(false);
  });
});
