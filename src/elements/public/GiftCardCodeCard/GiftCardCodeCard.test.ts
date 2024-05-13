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
});
