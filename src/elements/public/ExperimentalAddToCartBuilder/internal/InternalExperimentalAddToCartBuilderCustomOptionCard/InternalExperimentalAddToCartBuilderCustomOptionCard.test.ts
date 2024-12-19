import './index';

import { InternalExperimentalAddToCartBuilderCustomOptionCard as Card } from './InternalExperimentalAddToCartBuilderCustomOptionCard';
import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';

describe('ExperimentalAddToCartBuilder', () => {
  describe('InternalExperimentalAddToCartBuilderCustomOptionCard', () => {
    it('imports and defines foxy-internal-card', () => {
      expect(customElements.get('foxy-internal-card')).to.exist;
    });

    it('defines itself as foxy-internal-experimental-add-to-cart-builder-custom-option-card', () => {
      const localName = 'foxy-internal-experimental-add-to-cart-builder-custom-option-card';
      expect(customElements.get(localName)).to.equal(Card);
    });

    it('extends foxy-internal-card', () => {
      expect(new Card()).to.be.instanceOf(customElements.get('foxy-internal-card'));
    });

    it('renders name and value of the custom option', async () => {
      const card = await fixture<Card>(
        html`<foxy-internal-experimental-add-to-cart-builder-custom-option-card></foxy-internal-experimental-add-to-cart-builder-custom-option-card>`
      );

      card.data = {
        _links: { self: { href: 'https://demo.api/virtual/empty' } },
        value: 'bar',
        name: 'foo',
      };

      await card.requestUpdate();

      expect(card.renderRoot.textContent).to.include('foo');
      expect(card.renderRoot.textContent).to.include('bar');
    });
  });
});
