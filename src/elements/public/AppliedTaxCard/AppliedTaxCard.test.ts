import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { AppliedTaxCard } from './AppliedTaxCard';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { createRouter } from '../../../server/index';
import { getByKey } from '../../../testgen/getByKey';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-html';

const router = createRouter();

describe('AppliedTaxCard', () => {
  it('extends TwoLineCard', () => {
    expect(new AppliedTaxCard()).to.be.instanceOf(TwoLineCard);
  });

  it('registers as foxy-applied-tax-card', () => {
    expect(customElements.get('foxy-applied-tax-card')).to.equal(AppliedTaxCard);
  });

  it('has a default i18next namespace of "applied-tax-card"', () => {
    expect(new AppliedTaxCard()).to.have.property('ns', 'applied-tax-card');
  });

  it('renders tax name in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-applied-tax-card @fetch=${handleFetch}></foxy-applied-tax-card>`;
    const element = await fixture<AppliedTaxCard>(layout);

    element.href = 'https://demo.api/hapi/applied_taxes/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'title');

    expect(title).to.include.text(element.data!.name);
  });

  it('renders amount in the subtitle', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-applied-tax-card @fetch=${handleFetch}></foxy-applied-tax-card>`;
    const element = await fixture<AppliedTaxCard>(layout);

    element.href = 'https://demo.api/hapi/applied_taxes/0';
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
      amount: `${data.amount} ${transaction.currency_code}`,
      currencyDisplay: store.use_international_currency_symbol ? 'code' : 'symbol',
    });

    expect(amount).to.have.attribute('options', options);
    expect(amount).to.have.attribute('lang', element.lang);
    expect(amount).to.have.attribute('ns', element.ns);
  });

  it('renders rate in the subtitle', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-applied-tax-card @fetch=${handleFetch}></foxy-applied-tax-card>`;
    const element = await fixture<AppliedTaxCard>(layout);

    element.href = 'https://demo.api/hapi/applied_taxes/0';
    element.lang = 'es';
    element.ns = 'foo';

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const subtitle = (await getByTestId(element, 'subtitle')) as HTMLDivElement;
    const rate = await getByKey(subtitle, 'percent');
    const options = JSON.stringify({ fraction: element.data!.rate / 100 });

    expect(rate).to.have.attribute('options', options);
    expect(rate).to.have.attribute('lang', element.lang);
    expect(rate).to.have.attribute('ns', element.ns);
  });
});
