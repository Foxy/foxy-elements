import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { InternalItemFormCartControl } from './index';

describe('ItemForm', () => {
  describe('InternalItemFormCartControl', () => {
    it('imports and defines foxy-internal-details', () => {
      expect(customElements.get('foxy-internal-details')).to.exist;
    });

    it('imports and defines foxy-internal-integer-control', () => {
      expect(customElements.get('foxy-internal-integer-control')).to.exist;
    });

    it('imports and defines foxy-internal-text-control', () => {
      expect(customElements.get('foxy-internal-text-control')).to.exist;
    });

    it('imports and defines foxy-internal-date-control', () => {
      expect(customElements.get('foxy-internal-date-control')).to.exist;
    });

    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines itself as foxy-internal-item-form-cart-control', () => {
      expect(customElements.get('foxy-internal-item-form-cart-control')).to.equal(
        InternalItemFormCartControl
      );
    });

    it('extends InternalControl', () => {
      expect(new InternalItemFormCartControl()).to.be.instanceOf(InternalControl);
    });

    it('has an empty i18n namespace by default', () => {
      expect(InternalItemFormCartControl).to.have.property('defaultNS', '');
      expect(new InternalItemFormCartControl()).to.have.property('ns', '');
    });

    it('has a default inference target named "cart"', () => {
      expect(new InternalItemFormCartControl()).to.have.property('infer', 'cart');
    });

    it('renders details with summary', async () => {
      const element = await fixture<InternalItemFormCartControl>(html`
        <foxy-internal-item-form-cart-control></foxy-internal-item-form-cart-control>
      `);

      const details = element.renderRoot.querySelector('foxy-internal-details');

      expect(details).to.exist;
      expect(details).to.have.property('infer', '');
      expect(details).to.have.property('summary', 'title');
    });

    it('renders expiration timeout as a control', async () => {
      const element = await fixture<InternalItemFormCartControl>(html`
        <foxy-internal-item-form-cart-control></foxy-internal-item-form-cart-control>
      `);

      const control = element.renderRoot.querySelector(
        'foxy-internal-date-control[infer="expires"]'
      );

      expect(control).to.exist;
      expect(control).to.have.property('format', 'unix');
    });

    it('renders item url as a control', async () => {
      const element = await fixture<InternalItemFormCartControl>(html`
        <foxy-internal-item-form-cart-control></foxy-internal-item-form-cart-control>
      `);

      expect(element.renderRoot.querySelector('foxy-internal-text-control[infer="url"]')).to.exist;
    });

    it('renders item image as a control', async () => {
      const element = await fixture<InternalItemFormCartControl>(html`
        <foxy-internal-item-form-cart-control></foxy-internal-item-form-cart-control>
      `);

      const control = element.renderRoot.querySelector('foxy-internal-text-control[infer="image"]');
      expect(control).to.exist;
    });

    it('renders minimum quantity as a control', async () => {
      const element = await fixture<InternalItemFormCartControl>(html`
        <foxy-internal-item-form-cart-control></foxy-internal-item-form-cart-control>
      `);

      const control = element.renderRoot.querySelector(
        'foxy-internal-integer-control[infer="quantity-min"]'
      );

      expect(control).to.exist;
    });

    it('renders maximum quantity as a control', async () => {
      const element = await fixture<InternalItemFormCartControl>(html`
        <foxy-internal-item-form-cart-control></foxy-internal-item-form-cart-control>
      `);

      const control = element.renderRoot.querySelector(
        'foxy-internal-integer-control[infer="quantity-max"]'
      );

      expect(control).to.exist;
    });
  });
});
