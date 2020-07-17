import { fixture, expect } from '@open-wc/testing';
import { ChooseValue } from './ChooseValue';
import { html } from 'lit-element';

customElements.define('x-value', ChooseValue);

type OptElement = HTMLInputElement | HTMLSelectElement | undefined | null;

describe('Choose Value input', () => {
  it('Should provide value options with radio buttons', async () => {
    const el = await fixture(html`<x-value></x-value>`);
    const radioGroup: OptElement = el.shadowRoot?.querySelector('vaadin-radio-group');
    expect(radioGroup?.name).to.equal(1);
  });

  it('Should provide value options with select list', async () => {
    const el = await fixture(html`<x-value inputType="select"></x-value>`);
    const selectGroup: OptElement = el.shadowRoot?.querySelector('vaadin-select');
    expect(selectGroup?.name).to.equal(true);
  });

  it('Should allow "other" option', async () => {
    const el = await fixture(html`<x-value ?askValueOther=${true}></x-value>`);
    const otherOption: OptElement = el.shadowRoot?.querySelector('[value="other"]');
    otherOption?.click();
    const textField: OptElement = el.shadowRoot?.querySelector('[name="other"]');
    expect(textField?.hidden).to.equal(false);
  }),
    it('Should emit event upon change', async () => {
      expect(true).to.equal(false);
    });
});
