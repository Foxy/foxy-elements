import './index';

import { expect, fixture, waitUntil } from '@open-wc/testing';

import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { TaxCard } from './TaxCard';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { html } from 'lit-html';
import { router } from '../../../server';

describe('TaxCard', () => {
  it('extends TwoLineCard', () => {
    expect(new TaxCard()).to.be.instanceOf(TwoLineCard);
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

    await waitUntil(() => !!element.data, undefined, { timeout: 5000 });
    const title = await getByTestId(element, 'title');

    expect(title).to.include.text(element.data!.name);
  });

  it('renders tax_global key for global taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');
    data.type = 'global';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('tax_global');
  });

  it('renders tax_union key for EU taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');

    data.type = 'union';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('tax_union');
  });

  it('renders country code for country-wide taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');

    data.type = 'country';
    data.country = 'US';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('US');
  });

  it('renders country and region code for regional taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');

    data.type = 'region';
    data.country = 'US';
    data.region = 'AL';

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('US');
    expect(subtitle).to.include.text('AL');
  });

  it('renders country, region and city for local taxes in the subtitle', async () => {
    const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');

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
    const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');

    data.is_live = false;
    data.rate = 10;

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('percent');
  });

  it('renders custom label for taxes using onesource provider in the subtitle', async () => {
    const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');

    data.is_live = true;
    data.service_provider = 'onesource' as Data['service_provider'];

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('Thomson Reuters ONESOURCE');
  });

  it('renders custom label for taxes using avalara provider in the subtitle', async () => {
    const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');

    data.is_live = true;
    data.service_provider = 'avalara' as Data['service_provider'];

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('Avalara AvaTax 15');
  });

  it('renders custom label for taxes using taxjar provider in the subtitle', async () => {
    const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');

    data.is_live = true;
    data.service_provider = 'taxjar' as Data['service_provider'];

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('TaxJar');
  });

  it('renders tax_rate_provider_default key for taxes using default provider in the subtitle', async () => {
    const data = await getTestData<Data>('./s/admin/stores/0/taxes/0');

    data.is_live = true;
    data.service_provider = '' as Data['service_provider'];

    const element = await fixture<TaxCard>(html`<foxy-tax-card .data=${data}></foxy-tax-card>`);
    const subtitle = await getByTestId(element, 'subtitle');

    expect(subtitle).to.include.text('tax_rate_provider_default');
  });
});
