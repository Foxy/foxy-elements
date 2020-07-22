import { fixture, expect } from '@open-wc/testing';
import { DonationForm } from './DonationForm';
import { html } from 'lit-element';

customElements.define('x-donation', DonationForm);

describe('Choose Designation input', () => {
  it('Should provide a text input to fill the designation', async () => {
    const el = await fixture(html`<x-donation></x-donation>`);
    const fields = [
      'name',
      'code',
      'price',
      'quantity',
      'anonymous',
      'designation',
      'sub_frequency',
    ];
    for (const name of fields) {
      expect(el.shadowRoot?.querySelectorAll(`[name="${name}"]`).length).to.equal(1);
    }
  });
});
