import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { TaxCard } from './TaxCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-html';
import { createRouter } from '../../../server/index';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { getByKey } from '../../../testgen/getByKey';

const router = createRouter();

describe('TaxCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('extends InternalCard', () => {
    expect(new TaxCard()).to.be.instanceOf(InternalCard);
  });

  it('registers as foxy-tax-card', () => {
    expect(customElements.get('foxy-tax-card')).to.equal(TaxCard);
  });

  it('has a default i18next namespace of "tax-card"', () => {
    expect(new TaxCard()).to.have.property('ns', 'tax-card');
  });

  it('renders tax name in the title', async () => {
    const handleFetch = (evt: FetchEvent) => router.handleEvent(evt);
    const layout = html`<foxy-tax-card @fetch=${handleFetch}></foxy-tax-card>`;
    const element = await fixture<TaxCard>(layout);

    element.href = 'https://demo.api/hapi/taxes/0';
    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'title');

    expect(title).to.include.text(element.data!.name);
  });

  it('renders tax_global key for global taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');
    data.type = 'global';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('tax_global');
  });

  it('renders tax_union key for EU taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');

    data.type = 'union';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('tax_union');
  });

  it('renders tax_custom_tax key for custom tax endpoint taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');
    data.type = 'custom_tax_endpoint';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('tax_custom_tax');
  });

  it('renders country code for country-wide taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');

    data.type = 'country';
    data.country = 'US';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('US');
  });

  it('renders country and region code for regional taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');

    data.type = 'region';
    data.country = 'US';
    data.region = 'AL';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('US');
    expect(subtitle).to.include.text('AL');
  });

  it('renders country, region and city for local taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');

    data.type = 'local';
    data.country = 'US';
    data.region = 'AL';
    data.city = 'Birmingham';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('US');
    expect(subtitle).to.include.text('AL');
    expect(subtitle).to.include.text('Birmingham');
  });

  it('renders localized % key for fixed rate taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');

    data.is_live = false;
    data.rate = 10;

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('percent');
  });

  it('renders custom label for taxes using onesource provider in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');

    data.is_live = true;
    data.service_provider = 'onesource';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('Thomson Reuters ONESOURCE');
  });

  it('renders custom label for taxes using avalara provider in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');

    data.is_live = true;
    data.service_provider = 'avalara';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('Avalara AvaTax 15');
  });

  it('renders custom label for taxes using taxjar provider in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');

    data.is_live = true;
    data.service_provider = 'taxjar';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('TaxJar');
  });

  it('renders custom label for taxes using custom_tax_endpoint provider in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');

    data.is_live = true;
    data.service_provider = 'custom_tax';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('tax_rate_provider_custom');
  });

  it('renders tax_rate_provider_default key for taxes using default provider in the subtitle', async () => {
    const data = await getTestData<Data>('./hapi/taxes/0');

    data.is_live = true;
    data.service_provider = '';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('tax_rate_provider_default');
  });

  it('renders item categories count', async () => {
    const router = createRouter();
    const element = await fixture<TaxCard>(html`
      <foxy-tax-card
        href="https://demo.api/hapi/taxes/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-tax-card>
    `);

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const label = await getByKey(element, 'tax_item_categories');
    const taxItemCategories = await getTestData<Resource<Rels.TaxItemCategories>>(
      element.data!._links['fx:tax_item_categories'].href
    );

    expect(label).to.exist;
    expect(label).to.have.attribute('infer', '');
    expect(label).to.have.attribute(
      'options',
      JSON.stringify({
        context: 'empty',
        count: taxItemCategories.total_items,
      })
    );
  });
});
