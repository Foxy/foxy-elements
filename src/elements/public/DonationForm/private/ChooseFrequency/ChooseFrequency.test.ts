import { fixture, expect } from '@open-wc/testing';
import { ChooseFrequency } from './ChooseFrequency';
import { html } from 'lit-element';

customElements.define('x-frequency', ChooseFrequency);

describe('Choose Frequency input', () => {
  it('Should provide a checkbox to make it recurring', async () => {
    const el = await fixture(html`<x-frequency></x-frequency>`);
    expect(el.shadowRoot?.querySelectorAll('[name="recurring"').length).to.equal(1);
  });

  it('Should initially hide frequency choice field', async () => {
    const el = await fixture(html`<x-frequency></x-frequency>`);
    const selectList: HTMLInputElement | null | undefined = el.shadowRoot?.querySelector(
      '[name="recuring-value"]'
    );
    expect(selectList?.hidden).to.equal(true);
  });

  it('Should reveal frequency options', async () => {
    const el = await fixture(html`<x-frequency></x-frequency>`);
    const checkBox: HTMLInputElement | null | undefined = el.shadowRoot?.querySelector(
      'vaadin-checkbox'
    );
    checkBox?.click();
    const selectList: HTMLInputElement | null | undefined = el.shadowRoot?.querySelector(
      '[name="recuring-value"]'
    );
    expect(selectList?.hidden).to.equal(false);
  }),
    it('Should emit event upon change', async () => {
      expect(true).to.equal(false);
    });
});
