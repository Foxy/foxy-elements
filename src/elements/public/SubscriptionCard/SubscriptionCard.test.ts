import { expect, fixture, html, waitUntil } from '@open-wc/testing';

import { Data } from './types';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { SubscriptionCard } from './index';
import { getByTag } from '../../../testgen/getByTag';
import { getByTestId } from '../../../testgen/getByTestId';
import { getTestData } from '../../../testgen/getTestData';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';

describe('SubscriptionCard', () => {
  it('registers as foxy-subscription-card', () => {
    expect(customElements.get('foxy-subscription-card')).to.equal(SubscriptionCard);
  });

  it('extends NucleonElement', () => {
    expect(document.createElement('foxy-subscription-card')).to.be.instanceOf(NucleonElement);
  });

  it('once loaded, renders subscription summary', async () => {
    const href = './s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';
    const data = await getTestData<Data>(href);
    const layout = html`<foxy-subscription-card lang="es" .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'summary');
    const items = data._embedded['fx:transaction_template']._embedded['fx:items'];
    const options = {
      most_expensive_item: [...items].sort((a, b) => a.price - b.price)[0],
      count: items.length,
    };

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.attribute('options', JSON.stringify(options));
    expect(control).to.have.attribute('lang', 'es');
    expect(control).to.have.attribute('key', 'transaction_summary');
    expect(control).to.have.attribute('ns', 'subscription-card');
  });

  it('once loaded, renders a special status for failed subscriptions', async () => {
    const href = './s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';
    const date = new Date().toISOString();
    const data = { ...(await getTestData<Data>(href)), first_failed_transaction_date: date };
    const layout = html`<foxy-subscription-card lang="es" .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'status');

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.attribute('options', JSON.stringify({ date }));
    expect(control).to.have.attribute('lang', 'es');
    expect(control).to.have.attribute('key', 'subscription_failed');
    expect(control).to.have.attribute('ns', 'subscription-card');
  });

  it('once loaded, renders a special status for subscriptions that are about to end', async () => {
    const href = './s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';
    const data = await getTestData<Data>(href);

    data.first_failed_transaction_date = null;
    data.end_date = new Date(Date.now() + 86400000).toISOString();

    const layout = html`<foxy-subscription-card lang="es" .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'status');

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.attribute('options', JSON.stringify({ date: data.end_date }));
    expect(control).to.have.attribute('lang', 'es');
    expect(control).to.have.attribute('key', 'subscription_will_be_cancelled');
    expect(control).to.have.attribute('ns', 'subscription-card');
  });

  it('once loaded, renders a special status for subscriptions that have ended', async () => {
    const href = './s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';
    const data = await getTestData<Data>(href);

    data.first_failed_transaction_date = null;
    data.end_date = new Date(2020, 0, 1).toISOString();

    const layout = html`<foxy-subscription-card lang="es" .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'status');

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.attribute('options', JSON.stringify({ date: data.end_date }));
    expect(control).to.have.attribute('lang', 'es');
    expect(control).to.have.attribute('key', 'subscription_cancelled');
    expect(control).to.have.attribute('ns', 'subscription-card');
  });

  it('once loaded, renders a special status for active subscriptions', async () => {
    const href = './s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';
    const data = await getTestData<Data>(href);

    data.first_failed_transaction_date = null;
    data.end_date = null;

    const layout = html`<foxy-subscription-card lang="es" .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'status');
    const options = { date: data.next_transaction_date };

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.attribute('options', JSON.stringify(options));
    expect(control).to.have.attribute('lang', 'es');
    expect(control).to.have.attribute('key', 'subscription_active');
    expect(control).to.have.attribute('ns', 'subscription-card');
  });

  it('once loaded, renders subscription price', async () => {
    const href = './s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';
    const data = await getTestData<Data>(href);

    data._embedded['fx:last_transaction'].total_order = 25;
    data._embedded['fx:last_transaction'].currency_code = 'eur';
    data.frequency = '3w';

    const layout = html`<foxy-subscription-card lang="es" .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'price');
    const options = { count: 3, units: 'weekly', amount: '25 eur' };

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.attribute('options', JSON.stringify(options));
    expect(control).to.have.attribute('lang', 'es');
    expect(control).to.have.attribute('key', 'price_recurring');
    expect(control).to.have.attribute('ns', 'subscription-card');
  });

  it('once loaded, renders subscription price for ".5m" frequency', async () => {
    const href = './s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';
    const data = await getTestData<Data>(href);

    data._embedded['fx:last_transaction'].total_order = 25;
    data._embedded['fx:last_transaction'].currency_code = 'eur';
    data.frequency = '.5m';

    const layout = html`<foxy-subscription-card lang="es" .data=${data}></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'price');
    const options = { count: null, units: 'monthly', amount: '25 eur' };

    expect(control).to.have.property('localName', 'foxy-i18n');
    expect(control).to.have.attribute('options', JSON.stringify(options));
    expect(control).to.have.attribute('lang', 'es');
    expect(control).to.have.attribute('key', 'price_twice_a_month');
    expect(control).to.have.attribute('ns', 'subscription-card');
  });

  it('renders empty foxy-spinner by default', async () => {
    const layout = html`<foxy-subscription-card lang="es"></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'spinner');

    expect(control!).not.to.have.class('opacity-0');
    expect(control!.firstElementChild).to.have.property('localName', 'foxy-spinner');
    expect(control!.firstElementChild).to.have.attribute('state', 'empty');
    expect(control!.firstElementChild).to.have.attribute('lang', 'es');
    expect(control!.firstElementChild).to.have.attribute('ns', 'subscription-card spinner');
  });

  it('renders busy foxy-spinner while loading data', async () => {
    const layout = html`<foxy-subscription-card href="/" lang="es"></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'spinner');

    expect(control!).not.to.have.class('opacity-0');
    expect(control!.firstElementChild).to.have.property('localName', 'foxy-spinner');
    expect(control!.firstElementChild).to.have.attribute('state', 'busy');
    expect(control!.firstElementChild).to.have.attribute('lang', 'es');
    expect(control!.firstElementChild).to.have.attribute('ns', 'subscription-card spinner');
  });

  it('renders error foxy-spinner if loading data fails', async () => {
    const layout = html`<foxy-subscription-card href="/" lang="es"></foxy-subscription-card>`;
    const element = await fixture<SubscriptionCard>(layout);
    const control = await getByTestId(element, 'spinner');

    await waitUntil(() => element.in('fail'));

    expect(control!).not.to.have.class('opacity-0');
    expect(control!.firstElementChild).to.have.property('localName', 'foxy-spinner');
    expect(control!.firstElementChild).to.have.attribute('state', 'error');
    expect(control!.firstElementChild).to.have.attribute('lang', 'es');
    expect(control!.firstElementChild).to.have.attribute('ns', 'subscription-card spinner');
  });

  it('hides foxy-spinner once loaded', async () => {
    const href = './s/admin/subscriptions/0?zoom=last_transaction,transaction_template:items';
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
