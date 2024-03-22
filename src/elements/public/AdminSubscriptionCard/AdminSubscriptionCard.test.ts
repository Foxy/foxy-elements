import './index';

import { AdminSubscriptionCard as Card } from './AdminSubscriptionCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { I18n } from '../I18n/I18n';
import { Resource } from '@foxy.io/sdk/core';
import { Rels } from '@foxy.io/sdk/backend';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { getByKey } from '../../../testgen/getByKey';
import { parseFrequency } from '../../../utils/parse-frequency';

describe('AdminSubscriptionCard', () => {
  it('imports and registers foxy-i18n element', () => {
    expect(customElements.get('foxy-i18n')).to.equal(I18n);
  });

  it('imports and registers foxy-nucleon element', () => {
    expect(customElements.get('foxy-nucleon')).to.equal(NucleonElement);
  });

  it('imports and registers foxy-internal-card element', () => {
    expect(customElements.get('foxy-internal-card')).to.equal(InternalCard);
  });

  it('imports and registers itself as foxy-admin-subscription-card', () => {
    expect(customElements.get('foxy-admin-subscription-card')).to.equal(Card);
  });

  it('has a default i18n namespace "admin-subscription-card"', () => {
    expect(Card.defaultNS).to.equal('admin-subscription-card');
  });

  it('has a reactive property "localeCodes" (attribute "locale-codes", String, null by default)', () => {
    expect(Card).to.have.nested.property('properties.localeCodes');
    expect(Card).to.have.nested.property('properties.localeCodes.attribute', 'locale-codes');
    expect(Card).to.not.have.nested.property('properties.localeCodes.type');
    expect(new Card()).to.have.property('localeCodes', null);
  });

  it('extends InternalCard', () => {
    expect(new Card()).to.be.instanceOf(InternalCard);
  });

  it('renders exact item count in line 1 if less than 20 items are embedded', async () => {
    type Subscription = Resource<Rels.Subscription, { zoom: { transaction_template: 'items' } }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template:items';
    const data = await getTestData<Subscription>(href, router);
    const items = data._embedded['fx:transaction_template']._embedded['fx:items'];

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data._embedded['fx:transaction_template']._embedded['fx:items'] = [items[0]];

    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const summary = await getByKey(element, 'summary');

    expect(summary).to.exist;
    expect(summary).to.have.attribute('infer', '');
    expect(summary).to.have.nested.property('options.count', 1);
  });

  it('renders approximate item count in line 1 if exactly 20 items are embedded', async () => {
    type Subscription = Resource<Rels.Subscription, { zoom: { transaction_template: 'items' } }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template:items';
    const data = await getTestData<Subscription>(href, router);
    const items = data._embedded['fx:transaction_template']._embedded['fx:items'];

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data._embedded['fx:transaction_template']._embedded['fx:items'] = new Array(20).fill(items[0]);

    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const summary = await getByKey(element, 'summary_approximate');

    expect(summary).to.exist;
    expect(summary).to.have.attribute('infer', '');
  });

  it('renders exact item count in line 1 if items are not embedded', async () => {
    type Items = Resource<Rels.Items>;
    type Subscription = Resource<Rels.Subscription, { zoom: 'transaction_template' }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template';
    const data = await getTestData<Subscription>(href, router);
    const cart = data._embedded['fx:transaction_template'];
    const items = await getTestData<Items>(cart._links['fx:items'].href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const summary = await getByKey(element, 'summary');

    expect(summary).to.exist;
    expect(summary).to.have.attribute('infer', '');
    expect(summary).to.have.nested.property('options.count', items.total_items);
  });

  it('renders first item name if items are embedded', async () => {
    type Subscription = Resource<Rels.Subscription, { zoom: { transaction_template: 'items' } }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template:items';
    const data = await getTestData<Subscription>(href, router);
    const items = data._embedded['fx:transaction_template']._embedded['fx:items'];

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data._embedded['fx:transaction_template']._embedded['fx:items'] = [items[0]];
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const summary = await getByKey(element, 'summary');

    expect(summary).to.exist;
    expect(summary).to.have.attribute('infer', '');
    expect(summary).to.have.deep.nested.property('options.firstItem', items[0]);
  });

  it('renders first item name if items are not embedded', async () => {
    type Items = Resource<Rels.Items>;
    type Subscription = Resource<Rels.Subscription, { zoom: 'transaction_template' }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template';
    const data = await getTestData<Subscription>(href, router);
    const cart = data._embedded['fx:transaction_template'];
    const items = await getTestData<Items>(cart._links['fx:items'].href, router);
    const firstItem = items._embedded['fx:items'][0];

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const summary = await getByKey(element, 'summary');

    expect(summary).to.exist;
    expect(summary).to.have.attribute('infer', '');
    expect(summary).to.have.deep.nested.property('options.firstItem', firstItem);
  });

  ['y', 'm', 'w', 'd'].forEach((units, count) => {
    it(`renders regular frequencies (y,m,w,d) in line 1 (testing: ${units})`, async () => {
      const router = createRouter();
      const href = 'https://demo.api/hapi/subscriptions/0';
      const data = await getTestData<Resource<Rels.Subscription>>(href, router);

      const element = await fixture<Card>(html`
        <foxy-admin-subscription-card
          locale-codes="https://demo.api/hapi/property_helpers/7"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-admin-subscription-card>
      `);

      data.frequency = `${count}${units}`;
      element.data = data;

      await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
      const price = await getByKey(element, 'price_recurring');

      expect(price).to.exist;
      expect(price).to.have.attribute('infer', '');
      expect(price).to.have.nested.property('options.count', count);
      expect(price).to.have.nested.property('options.units', parseFrequency(data.frequency).units);
    });
  });

  it('renders special frequency for twice-a-month subscriptions in line 1', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data.frequency = '.5m';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'price_twice_a_month');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
  });

  it('renders total order in line 1 if transaction template is embedded', async () => {
    type Subscription = Resource<Rels.Subscription, { zoom: 'transaction_template' }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template';
    const data = await getTestData<Subscription>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data._embedded['fx:transaction_template'].total_order = 123;
    data.frequency = '1m';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'price_recurring');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.amount');
    expect(price?.options.amount.split(' ')[0]).to.equal('123');
  });

  it('renders total order in line 1 if transaction template is not embedded', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    await new Card.API(element).fetch(data._links['fx:transaction_template'].href, {
      method: 'PATCH',
      body: JSON.stringify({ total_order: 456 }),
    });

    data.frequency = '1m';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'price_recurring');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.amount');
    expect(price?.options.amount.split(' ')[0]).to.equal('456');
  });

  it('uses store-wide currency display settings (intl symbol: true) to render total order in line 1', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    await new Card.API(element).fetch(data._links['fx:store'].href, {
      method: 'PATCH',
      body: JSON.stringify({ use_international_currency_symbol: true }),
    });

    data.frequency = '1m';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'price_recurring');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.currencyDisplay', 'code');
  });

  it('uses store-wide currency display settings (intl symbol: false) to render total order in line 1', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    await new Card.API(element).fetch(data._links['fx:store'].href, {
      method: 'PATCH',
      body: JSON.stringify({ use_international_currency_symbol: false }),
    });

    data.frequency = '1m';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'price_recurring');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.currencyDisplay', 'symbol');
  });

  it('uses currency code from the embedded fx:transaction_template for total order in line 1 when available', async () => {
    type Subscription = Resource<Rels.Subscription, { zoom: 'transaction_template' }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template';
    const data = await getTestData<Subscription>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data._embedded['fx:transaction_template'].currency_code = 'CAD';
    data.frequency = '1m';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'price_recurring');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.amount');
    expect(price?.options.amount.split(' ')[1]).to.equal('CAD');
  });

  it('uses currency code from the remote fx:transaction_template for total order in line 1 when available', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    await new Card.API(element).fetch(data._links['fx:transaction_template'].href, {
      method: 'PATCH',
      body: JSON.stringify({ currency_code: 'UAH' }),
    });

    data.frequency = '1m';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'price_recurring');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.amount');
    expect(price?.options.amount.split(' ')[1]).to.equal('UAH');
  });

  it('uses currency code from the locale of a custom fx:template_set for total order in line 1 as a fallback when available', async () => {
    type Subscription = Resource<Rels.Subscription, { zoom: 'transaction_template' }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template';
    const data = await getTestData<Subscription>(href, router);
    const cart = data._embedded['fx:transaction_template'];

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    delete cart.currency_code;
    cart.template_set_uri = 'https://demo.api/hapi/template_sets/0';

    await new Card.API(element).fetch('https:/demo.api/hapi/template_sets/0', {
      method: 'PATCH',
      body: JSON.stringify({ code: 'TEST', locale_code: 'ar_EG' }),
    });

    await new Card.API(element).fetch('https:/demo.api/hapi/property_helpers/7', {
      method: 'PATCH',
      body: JSON.stringify({ values: { ar_EG: 'Arabic locale for Egypt (Currency: EGP:£E)' } }),
    });

    data.frequency = '1m';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'price_recurring');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.amount');
    expect(price?.options.amount.split(' ')[1]).to.equal('EGP');
  });

  it('uses currency code from the locale of a default fx:template_set for total order in line 1 as a fallback', async () => {
    type Subscription = Resource<Rels.Subscription, { zoom: 'transaction_template' }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template';
    const data = await getTestData<Subscription>(href, router);
    const cart = data._embedded['fx:transaction_template'];

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    delete cart.currency_code;
    cart.template_set_uri = '';

    await new Card.API(element).fetch('https:/demo.api/hapi/template_sets/0', {
      method: 'PATCH',
      body: JSON.stringify({ code: 'DEFAULT', locale_code: 'ur_PK' }),
    });

    await new Card.API(element).fetch('https:/demo.api/hapi/property_helpers/7', {
      method: 'PATCH',
      body: JSON.stringify({ values: { ur_PK: 'Urdu locale for Pakistan (Currency: PKR:Rs)' } }),
    });

    data.frequency = '1m';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'price_recurring');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.amount');
    expect(price?.options.amount.split(' ')[1]).to.equal('PKR');
  });

  it('renders a special status in line 2 for failed subscriptions', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data.first_failed_transaction_date = new Date(2022, 1, 1).toISOString();
    data.start_date = new Date(2020, 1, 1).toISOString();
    data.is_active = true;
    data.end_date = null;
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'subscription_failed');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.date', data.first_failed_transaction_date);
  });

  it('renders a special status in line 2 for active subscriptions with an end date in the future', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data.first_failed_transaction_date = null;
    data.start_date = new Date(2020, 1, 1).toISOString();
    data.is_active = true;
    data.end_date = new Date(Date.now() + 2.628e9).toISOString();
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'subscription_will_be_cancelled');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.date', data.end_date);
  });

  it('renders a special status in line 2 for subscriptions that have ended', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data.first_failed_transaction_date = null;
    data.start_date = new Date(2020, 1, 1).toISOString();
    data.is_active = true;
    data.end_date = new Date(2022, 1, 1).toISOString();
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'subscription_cancelled');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
    expect(price).to.have.nested.property('options.date', data.end_date);
  });

  it('renders a special status in line 2 for inactive subscriptions', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data.first_failed_transaction_date = null;
    data.start_date = new Date(2020, 1, 1).toISOString();
    data.is_active = false;
    data.end_date = null;
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'subscription_inactive');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
  });

  it('renders a special status in line 2 for active subscriptions', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data.first_failed_transaction_date = null;
    data.start_date = new Date(2020, 1, 1).toISOString();
    data.is_active = true;
    data.end_date = null;
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'subscription_active');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
  });

  it('renders a special status in line 2 for subscriptions that start soon', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data.first_failed_transaction_date = null;
    data.start_date = new Date(Date.now() + 3600000).toISOString();
    data.is_active = true;
    data.end_date = null;
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    const price = await getByKey(element, 'subscription_will_be_active');

    expect(price).to.exist;
    expect(price).to.have.attribute('infer', '');
  });

  it('renders customer email in line 3 from embedded fx:transaction_template', async () => {
    type Subscription = Resource<Rels.Subscription, { zoom: 'transaction_template' }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=transaction_template';
    const data = await getTestData<Subscription>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data._embedded['fx:transaction_template'].customer_email = 'test@test.com';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    expect(element.renderRoot).to.include.text('test@test.com');
  });

  it('renders customer email in line 3 from remote fx:transaction_template', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    await new Card.API(element).fetch(data._links['fx:transaction_template'].href, {
      method: 'PATCH',
      body: JSON.stringify({ customer_email: 'test@test-remote.com' }),
    });

    element.data = data;
    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });

    expect(element.renderRoot).to.include.text('test@test-remote.com');
  });

  it('renders customer name in line 3 from embedded fx:customer', async () => {
    type Subscription = Resource<Rels.Subscription, { zoom: ['customer'] }>;

    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0?zoom=customer';
    const data = await getTestData<Subscription>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    data._embedded['fx:customer'].first_name = 'Test';
    data._embedded['fx:customer'].last_name = 'User';
    element.data = data;

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    expect(element.renderRoot).to.include.text('Test User');
  });

  it('renders customer name in line 3 from remote fx:customer', async () => {
    const router = createRouter();
    const href = 'https://demo.api/hapi/subscriptions/0';
    const data = await getTestData<Resource<Rels.Subscription>>(href, router);

    const element = await fixture<Card>(html`
      <foxy-admin-subscription-card
        locale-codes="https://demo.api/hapi/property_helpers/7"
        href=${href}
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-card>
    `);

    await new Card.API(element).fetch(data._links['fx:customer'].href, {
      method: 'PATCH',
      body: JSON.stringify({ first_name: 'Test', last_name: 'User' }),
    });

    await waitUntil(() => element.isBodyReady, '', { timeout: 5000 });
    expect(element.renderRoot).to.include.text('Test User');
  });
});
