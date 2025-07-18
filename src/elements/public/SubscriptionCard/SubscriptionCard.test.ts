import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/customer';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { Data } from './types';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { SubscriptionCard } from './index';
import { createRouter } from '../../../server/index';
import { getByTag } from '../../../testgen/getByTag';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { getByKey } from '../../../testgen/getByKey';
import { getSubscriptionStatus } from '../../../utils/get-subscription-status';

describe('SubscriptionCard', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('registers as foxy-subscription-card', () => {
    expect(customElements.get('foxy-subscription-card')).to.equal(SubscriptionCard);
  });

  it('extends NucleonElement', () => {
    expect(document.createElement('foxy-subscription-card')).to.be.instanceOf(NucleonElement);
  });

  it('has a reactive property "settings"', () => {
    expect(new SubscriptionCard()).to.have.property('settings', null);
    expect(SubscriptionCard.properties).to.have.deep.property('settings', { type: Object });
  });

  it('once loaded, renders subscription summary', async () => {
    const href = './hapi/subscriptions/0?zoom=transaction_template:items';
    const data = await getTestData<Data>(href);
    const layout = html`<foxy-subscription-card .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'summary');
    const items = data._embedded['fx:transaction_template']._embedded['fx:items'];
    const options = {
      items,
      count_minus_three: items.length - 3,
      context: 'four_plus_items',
    };

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.deep.property('options', options);
    expect(control).to.have.attribute('infer', '');
    expect(control).to.have.attribute('key', 'summary');
  });

  it('once loaded, renders subscription status', async () => {
    const href = './hapi/subscriptions/0?zoom=transaction_template:items';
    const data = await getTestData<Data>(href);
    const layout = html`<foxy-subscription-card .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'status');

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.deep.property('options', data);
    expect(control).to.have.attribute('infer', '');
    expect(control).to.have.attribute('key', `status_${getSubscriptionStatus(data)}`);
  });

  it('once loaded, renders subscription price', async () => {
    const href = './hapi/subscriptions/0?zoom=transaction_template:items';
    const data = await getTestData<Data>(href);

    data._embedded['fx:transaction_template'].total_order = 25;
    data._embedded['fx:transaction_template'].currency_code = 'eur';
    data.frequency = '3w';

    const layout = html`<foxy-subscription-card .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'price');
    const options = { count: 3, units: 'weekly', amount: '25 eur' };

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.deep.property('options', options);
    expect(control).to.have.attribute('infer', '');
    expect(control).to.have.attribute('key', 'price_recurring');
  });

  it('once loaded, renders subscription price for ".5m" frequency', async () => {
    const href = './hapi/subscriptions/0?zoom=transaction_template:items';
    const data = await getTestData<Data>(href);

    data._embedded['fx:transaction_template'].total_order = 25;
    data._embedded['fx:transaction_template'].currency_code = 'eur';
    data.frequency = '.5m';

    const layout = html`<foxy-subscription-card .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'price');
    const options = { count: 0.5, units: 'monthly', amount: '25 eur' };

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.deep.property('options', options);
    expect(control).to.have.attribute('infer', '');
    expect(control).to.have.attribute('key', 'price_twice_a_month');
  });

  it('once loaded, renders subscription price without frequency if specified in cart display settings in customer mode', async () => {
    type Settings = Resource<Rels.CustomerPortalSettings>;
    const settings = await getTestData<Settings>('./portal/customer_portal_settings');
    settings.cart_display_config.show_sub_frequency = false;

    const href = './hapi/subscriptions/0?zoom=transaction_template:items';
    const data = await getTestData<Data>(href);

    data._embedded['fx:transaction_template'].total_order = 25;
    data._embedded['fx:transaction_template'].currency_code = 'eur';
    data.frequency = '3w';

    const layout = html`
      <foxy-subscription-card .data=${data} .settings=${settings}> </foxy-subscription-card>
    `;

    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'price');
    const options = { count: 3, units: 'weekly', amount: '25 eur' };

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.deep.property('options', options);
    expect(control).to.have.attribute('infer', '');
    expect(control).to.have.attribute('key', 'price');
  });

  it('once loaded, renders a hint about fees and taxes included in the price', async () => {
    const href = './hapi/subscriptions/0?zoom=transaction_template:items';
    const data = await getTestData<Data>(href);
    const layout = html`<foxy-subscription-card .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const hint = await getByKey(element, 'fees_hint');
    const explainer = await getByKey(element, 'fees_explainer');

    expect(hint).to.exist;
    expect(hint).to.have.attribute('infer', '');

    expect(explainer).to.exist;
    expect(explainer).to.have.attribute('infer', '');
  });

  it('renders empty foxy-spinner by default', async () => {
    const layout = html`<foxy-subscription-card></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'spinner');

    expect(control!).not.to.have.class('opacity-0');
    expect(control!.firstElementChild).to.have.property('localName', 'foxy-spinner');
    expect(control!.firstElementChild).to.have.attribute('state', 'empty');
    expect(control!.firstElementChild).to.have.attribute('infer', 'spinner');
  });

  it('renders busy foxy-spinner while loading data', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-subscription-card
        href="https://demo.api/virtual/stall"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-card>
    `;

    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'spinner');

    expect(control!).not.to.have.class('opacity-0');
    expect(control!.firstElementChild).to.have.property('localName', 'foxy-spinner');
    expect(control!.firstElementChild).to.have.attribute('state', 'busy');
    expect(control!.firstElementChild).to.have.attribute('infer', 'spinner');
  });

  it('renders error foxy-spinner if loading data fails', async () => {
    const router = createRouter();
    const layout = html`
      <foxy-subscription-card
        href="https://demo.api/virtual/empty?status=404"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-card>
    `;

    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'spinner');

    await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

    expect(control!).not.to.have.class('opacity-0');
    expect(control!.firstElementChild).to.have.property('localName', 'foxy-spinner');
    expect(control!.firstElementChild).to.have.attribute('state', 'error');
    expect(control!.firstElementChild).to.have.attribute('infer', 'spinner');
  });

  it('hides foxy-spinner once loaded', async () => {
    const href = './hapi/subscriptions/0?zoom=transaction_template:items';
    const data = await getTestData<Data>(href);
    const layout = html`<foxy-subscription-card .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);

    expect(await getByTestId(element, 'spinner')).to.have.class('opacity-0');
  });

  it('renders default slot', async () => {
    const layout = html`<foxy-subscription-card></foxy-subscription-card>`;
    const element = await fixture(layout);
    expect(await getByTag(element, 'slot')).to.have.property('name', '');
  });

  it('replaces default slot with template "default" if available', async () => {
    const name = 'default';
    const value = `<p>Value of the "${name}" template.</p>`;
    const element = await fixture<SubscriptionCard>(html`
      <foxy-subscription-card>
        <template>${unsafeHTML(value)}</template>
      </foxy-subscription-card>
    `);

    const slot = await getByTag<HTMLSlotElement>(element, 'slot');
    const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

    expect(slot).to.not.exist;
    expect(sandbox).to.contain.html(value);
  });
});
