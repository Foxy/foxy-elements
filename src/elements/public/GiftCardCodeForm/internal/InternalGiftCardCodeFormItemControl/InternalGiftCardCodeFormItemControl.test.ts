import './index';

import { InternalGiftCardCodeFormItemControl } from './InternalGiftCardCodeFormItemControl';
import { expect, fixture, html } from '@open-wc/testing';
import { NucleonElement } from '../../../NucleonElement';
import type { Data } from '../../types';
import { getTestData } from '../../../../../testgen/getTestData';

describe('GiftCardCodeForm', () => {
  describe('InternalGiftCardCodeFormItemControl', () => {
    it('imports and defines foxy-internal-control', () => {
      expect(customElements.get('foxy-internal-control')).to.exist;
    });

    it('imports and defines foxy-item-card', () => {
      expect(customElements.get('foxy-item-card')).to.exist;
    });

    it('imports and defines foxy-i18n', () => {
      expect(customElements.get('foxy-i18n')).to.exist;
    });

    it('defines itself as foxy-internal-gift-card-code-form-item-control', () => {
      expect(customElements.get('foxy-internal-gift-card-code-form-item-control')).to.equal(
        InternalGiftCardCodeFormItemControl
      );
    });

    it('renders a translatable label', async () => {
      const element = await fixture<InternalGiftCardCodeFormItemControl>(
        html`<foxy-internal-gift-card-code-form-item-control></foxy-internal-gift-card-code-form-item-control>`
      );

      const label = element.renderRoot.querySelector('foxy-i18n[key="label"]');

      expect(label).to.exist;
      expect(label).to.have.attribute('infer', '');
    });

    it('renders a foxy-item-card with a link to the transaction detail', async () => {
      const element = await fixture<InternalGiftCardCodeFormItemControl>(
        html`<foxy-internal-gift-card-code-form-item-control></foxy-internal-gift-card-code-form-item-control>`
      );

      const card = element.renderRoot.querySelector('foxy-item-card');
      expect(card).to.exist;
      expect(card).to.not.have.attribute('href');
      expect(card).to.have.attribute('infer', 'card');

      const nucleon = await fixture<NucleonElement<Data>>(html`<foxy-nucleon></foxy-nucleon>`);
      nucleon.data = await getTestData<Data>('./hapi/gift_card_codes/0');
      nucleon.append(element);
      element.inferProperties();
      await element.requestUpdate();

      const url = new URL(
        nucleon.data._links?.['fx:provisioned_by_transaction_detail_id'].href ?? ''
      );
      url.searchParams.set('zoom', 'item_options');
      expect(card).to.have.attribute('href', url.toString());
    });
  });
});
