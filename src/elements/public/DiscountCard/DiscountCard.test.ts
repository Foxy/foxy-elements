import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { DiscountCard } from './DiscountCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByKey } from '../../../testgen/getByKey';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-html';
import { router } from '../../../server';

describe('DiscountCard', () => {
  it('extends TwoLineCard', () => {
    expect(new DiscountCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-discount-card', () => {
    expect(customElements.get('foxy-discount-card')).to.equal(DiscountCard);
  });

  it('has a default i18next namespace of "discount-card"', () => {
    expect(new DiscountCard()).to.have.property('ns', 'discount-card');
  });

  it('renders discount name and code in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-discount-card @fetch=${handleFetch}></foxy-discount-card>`;
    const element = await fixture<DiscountCard>(layout);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'title');

    expect(title).to.include.text(element.data!.name);
    expect(title).to.include.text(element.data!.code);
  });

  it('renders discount amount in the subtitle', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-discount-card @fetch=${handleFetch}></foxy-discount-card>`;
    const element = await fixture<DiscountCard>(layout);

    element.href = 'https://demo.foxycart.com/s/admin/discounts/0';
    element.lang = 'es';
    element.ns = 'foo';

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const subtitle = (await getByTestId(element, 'subtitle')) as HTMLDivElement;
    const amount = await getByKey(subtitle, 'price');
    const data = element.data!;

    type Transaction = Resource<Rels.Transaction>;
    type Store = Resource<Rels.Store>;

    const store = await getTestData<Store>(data._links['fx:store'].href);
    const transaction = await getTestData<Transaction>(data._links['fx:transaction'].href);
    const options = JSON.stringify({
      currencyDisplay: store.use_international_currency_symbol ? 'code' : 'symbol',
      amount: `${Math.abs(data.amount)} ${transaction.currency_code}`,
    });

    expect(amount).to.have.attribute('options', options);
    expect(amount).to.have.attribute('lang', element.lang);
    expect(amount).to.have.attribute('ns', element.ns);
  });
});
