import './index';

import { GiftCardCodeCard as Card } from './GiftCardCodeCard';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { getTestData } from '../../../testgen/getTestData';
import { getByKey } from '../../../testgen/getByKey';
import { createRouter } from '../../../server';
import { FetchEvent } from '../NucleonElement/FetchEvent';

describe('GiftCardCodeCard', () => {
  it('imports and defines foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.exist;
  });

  it('imports and defines foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.exist;
  });

  it('imports and defines foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.exist;
  });

  it('defines itself as foxy-gift-card-code-card element', () => {
    expect(customElements.get('foxy-gift-card-code-card')).to.equal(Card);
  });

  it('has a default i18next namespace of `gift-card-code-card`', () => {
    expect(Card).to.have.property('defaultNS', 'gift-card-code-card');
    expect(new Card()).to.have.property('ns', 'gift-card-code-card');
  });

  it('extends foxy-internal-card', () => {
    expect(new Card()).to.be.instanceOf(customElements.get('foxy-internal-card'));
  });

  it('renders line 1 with data as content', async () => {
    const element = await fixture<Card>(html`
      <foxy-gift-card-code-card .data=${await getTestData('./hapi/gift_card_codes/0')}>
      </foxy-gift-card-code-card>
    `);

    const line1 = await getByKey(element, 'line_1');

    expect(line1).to.exist;
    expect(line1).to.have.attribute('infer', '');
    expect(line1).to.have.deep.property('options', element.data);
  });

  it('renders current balance', async () => {
    const router = createRouter();
    const element = await fixture<Card>(html`
      <foxy-gift-card-code-card
        href="https://demo.api/hapi/gift_card_codes/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-gift-card-code-card>
    `);

    await waitUntil(() => element.isBodyReady);
    const balance = element.renderRoot.querySelector('foxy-i18n[infer=""][key="current_balance"]');

    expect(balance).to.exist;
    expect(balance).to.have.deep.property('options', {
      currencyDisplay: 'code',
      value: `${element.data?.current_balance} USD`,
    });
  });

  it('renders line 2 with data as content', async () => {
    const element = await fixture<Card>(html`
      <foxy-gift-card-code-card .data=${await getTestData('./hapi/gift_card_codes/0')}>
      </foxy-gift-card-code-card>
    `);

    const line2 = await getByKey(element, 'line_2');

    expect(line2).to.exist;
    expect(line2).to.have.attribute('infer', '');
    expect(line2).to.have.deep.property('options', element.data);
  });

  describe('helper loaders and current user scope', () => {
    const denied = 'https://demo.api/virtual/denied';

    const create = async (scope: string) => {
      const router = createRouter();
      const data = await getTestData<any>('./hapi/gift_card_codes/0');
      data._links['fx:store'] = { href: denied };

      const element = await fixture<Card>(html`
        <foxy-gift-card-code-card
          current-user-scope=${scope}
          .data=${data}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-gift-card-code-card>
      `);

      await waitUntil(
        () => {
          const loaders = element.renderRoot.querySelectorAll<any>('foxy-nucleon');
          return [...loaders].every(loader => !loader.in('busy'));
        },
        '',
        { timeout: 5000 }
      );

      await element.requestUpdate();
      return element;
    };

    it('keeps selectors unchanged without a scope and with store_full_access', async () => {
      const element = new Card();

      [null, 'store_full_access'].forEach(scope => {
        element.currentUserScope = scope;
        expect(element.hiddenSelector.toString()).to.equal('');
        expect(element.readonlySelector.toString()).to.equal('');
      });
    });

    it('is read-only with gift_cards_read', () => {
      const element = new Card();
      element.currentUserScope = 'gift_cards_read item_categories_read';
      expect(element.readonlySelector.matches('any-control', true)).to.be.true;

      element.currentUserScope = 'gift_cards_write';
      expect(element.readonlySelector.matches('any-control', true)).to.be.false;
    });

    it('waits for a denied store without a scope or with stores_read', async () => {
      expect((await create('')).isBodyReady).to.be.false;
      expect((await create('gift_cards_read stores_read')).isBodyReady).to.be.false;
    });

    it('renders the balance with the currency symbol without stores_read', async () => {
      const element = await create('gift_cards_read');
      expect(element.isBodyReady).to.be.true;
      const balance = element.renderRoot.querySelector<any>('foxy-i18n[key="current_balance"]');
      expect(balance.options).to.deep.equal({
        currencyDisplay: 'symbol',
        value: `${element.data!.current_balance} USD`,
      });
    });
  });
});
