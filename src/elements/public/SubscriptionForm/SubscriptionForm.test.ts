import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import './index';

import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { createRouter as createBaseRouter } from '../../../server/router/createRouter';
import { InternalTimestampsControl } from '../../internal/InternalTimestampsControl/InternalTimestampsControl';
import { InternalAsyncListControl } from '../../internal/InternalAsyncListControl/InternalAsyncListControl';
import { SubscriptionForm as Form } from './SubscriptionForm';
import { InternalNumberControl } from '../../internal/InternalNumberControl/InternalNumberControl';
import { InternalCalendar } from '../../internal/InternalCalendar/InternalCalendar';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { InternalSandbox } from '../../internal/InternalSandbox/InternalSandbox';
import { TransactionCard } from '../TransactionCard/TransactionCard';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { parseFrequency } from '../../../utils/parse-frequency';
import { AttributeCard } from '../AttributeCard/AttributeCard';
import { AttributeForm } from '../AttributeForm/AttributeForm';
import { CustomerCard } from '../CustomerCard/CustomerCard';
import { createRouter } from '../../../server/index';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { getTestData } from '../../../testgen/getTestData';
import { getByTestId } from '../../../testgen/getByTestId';
import { unsafeHTML } from 'lit-html/directives/unsafe-html';
import { FormDialog } from '../FormDialog/FormDialog';
import { getByName } from '../../../testgen/getByName';
import { getByTag } from '../../../testgen/getByTag';
import { defaults } from '../../../server/hapi/defaults';
import { getByKey } from '../../../testgen/getByKey';
import { ItemCard } from '../ItemCard/ItemCard';
import { Choice } from '../../private/Choice/Choice';
import { links } from '../../../server/hapi/links';
import { I18n } from '../I18n/I18n';
import { stub } from 'sinon';
import { getSubscriptionStatus } from '../../../utils/get-subscription-status';

const fromDefaults = (key: string, overrides: Record<PropertyKey, unknown>) => {
  return { ...defaults[key](new URLSearchParams(), {}), ...overrides };
};

describe('SubscriptionForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines vcf-tooltip', () => {
    expect(customElements.get('vcf-tooltip')).to.exist;
  });

  it('imports and defines vaadin-combo-box', () => {
    expect(customElements.get('vaadin-combo-box')).to.exist;
  });

  it('imports and defines vaadin-button', () => {
    expect(customElements.get('vaadin-button')).to.exist;
  });

  it('imports and defines iron-icon', () => {
    expect(customElements.get('iron-icon')).to.exist;
  });

  it('imports and defines foxy-internal-timestamps-control', () => {
    const element = customElements.get('foxy-internal-timestamps-control');
    expect(element).to.equal(InternalTimestampsControl);
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    const element = customElements.get('foxy-internal-async-list-control');
    expect(element).to.equal(InternalAsyncListControl);
  });

  it('imports and defines foxy-internal-number-control', () => {
    const element = customElements.get('foxy-internal-number-control');
    expect(element).to.equal(InternalNumberControl);
  });

  it('imports and defines foxy-internal-calendar', () => {
    const element = customElements.get('foxy-internal-calendar');
    expect(element).to.equal(InternalCalendar);
  });

  it('imports and defines foxy-internal-sandbox', () => {
    const element = customElements.get('foxy-internal-sandbox');
    expect(element).to.equal(InternalSandbox);
  });

  it('imports and defines foxy-internal-form', () => {
    const element = customElements.get('foxy-internal-form');
    expect(element).to.equal(InternalForm);
  });

  it('imports and defines foxy-transaction-card', () => {
    const element = customElements.get('foxy-transaction-card');
    expect(element).to.equal(TransactionCard);
  });

  it('imports and defines foxy-nucleon', () => {
    const element = customElements.get('foxy-nucleon');
    expect(element).to.equal(NucleonElement);
  });

  it('imports and defines foxy-attribute-card', () => {
    const element = customElements.get('foxy-attribute-card');
    expect(element).to.equal(AttributeCard);
  });

  it('imports and defines foxy-attribute-form', () => {
    const element = customElements.get('foxy-attribute-form');
    expect(element).to.equal(AttributeForm);
  });

  it('imports and defines foxy-customer-card', () => {
    const element = customElements.get('foxy-customer-card');
    expect(element).to.equal(CustomerCard);
  });

  it('imports and defines foxy-form-dialog', () => {
    const element = customElements.get('foxy-form-dialog');
    expect(element).to.equal(FormDialog);
  });

  it('imports and defines foxy-item-card', () => {
    const element = customElements.get('foxy-item-card');
    expect(element).to.equal(ItemCard);
  });

  it('imports and defines foxy-i18n', () => {
    const element = customElements.get('foxy-i18n');
    expect(element).to.equal(I18n);
  });

  it('imports and defines itself as foxy-subscription-form', () => {
    expect(customElements.get('foxy-subscription-form')).to.equal(Form);
  });

  it('extends InternalForm', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('has a default i18n namespace "subscription-form"', () => {
    expect(Form).to.have.property('defaultNS', 'subscription-form');
    expect(new Form()).to.have.property('ns', 'subscription-form');
  });

  it('has a reactive property "getTransactionPageHref"', () => {
    type Data = Resource<Rels.Transaction>;
    const data = { _links: { 'fx:receipt': { href: 'test' } } } as unknown as Data;
    const definition = { attribute: false };
    expect(Form).to.have.deep.nested.property('properties.getTransactionPageHref', definition);
    expect(new Form()).to.have.property('getTransactionPageHref');
    expect(new Form().getTransactionPageHref('', data)).to.equal('test');
  });

  it('has a reactive property "getCustomerPageHref"', () => {
    const definition = { attribute: false };
    expect(Form).to.have.deep.nested.property('properties.getCustomerPageHref', definition);
    expect(new Form()).to.have.property('getCustomerPageHref', null);
  });

  it('has a reactive property "customerAddresses"', () => {
    const definition = { attribute: 'customer-addresses' };
    expect(Form).to.have.deep.nested.property('properties.customerAddresses', definition);
    expect(new Form()).to.have.property('customerAddresses', null);
  });

  it('has a reactive property "itemCategories"', () => {
    const definition = { attribute: 'item-categories' };
    expect(Form).to.have.deep.nested.property('properties.itemCategories', definition);
    expect(new Form()).to.have.property('itemCategories', null);
  });

  it('has a reactive property "localeCodes"', () => {
    const definition = { attribute: 'locale-codes' };
    expect(Form).to.have.deep.nested.property('properties.localeCodes', definition);
    expect(new Form()).to.have.property('localeCodes', null);
  });

  it('has a reactive property "settings"', () => {
    expect(Form).to.have.deep.nested.property('properties.settings', { type: Object });
    expect(new Form()).to.have.property('settings', null);
  });

  it('has a reactive property "coupons"', () => {
    expect(Form).to.have.deep.nested.property('properties.coupons', {});
    expect(new Form()).to.have.property('coupons', null);
  });

  describe('header', () => {
    it('renders a form header', () => {
      const form = new Form();
      const renderHeaderMethod = stub(form, 'renderHeader');
      form.render();
      expect(renderHeaderMethod).to.have.been.called;
    });

    it('once loaded, renders price and frequency in title (intl currency symbol: true)', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: {
          subscriptions: [fromDefaults('subscriptions', { id: 0, frequency: '3w' })],
          stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
          carts: [fromDefaults('carts', { id: 0, total_order: 25.99, currency_code: 'EUR' })],
        },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          href="https://demo.api/hapi/subscriptions/0"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      await waitUntil(() => !!element.headerTitleOptions.context, '', { timeout: 10000 });

      expect(element.headerTitleOptions).to.deep.equal({
        currencyDisplay: 'code',
        context: 'recurring',
        amount: '25.99 EUR',
        units: 'weekly',
        count: 3,
      });
    });

    it('once loaded, renders price and frequency in title (intl currency symbol: false)', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: {
          subscriptions: [fromDefaults('subscriptions', { id: 0, frequency: '3w' })],
          stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: false })],
          carts: [fromDefaults('carts', { id: 0, total_order: 25.99, currency_code: 'EUR' })],
        },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          href="https://demo.api/hapi/subscriptions/0"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      await waitUntil(() => !!element.headerTitleOptions.context, '', { timeout: 10000 });

      expect(element.headerTitleOptions).to.deep.equal({
        currencyDisplay: 'symbol',
        context: 'recurring',
        amount: '25.99 EUR',
        units: 'weekly',
        count: 3,
      });
    });

    it('once loaded, renders price and frequency in title (frequency: .5m)', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: {
          subscriptions: [fromDefaults('subscriptions', { id: 0, frequency: '.5m' })],
          stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: false })],
          carts: [fromDefaults('carts', { id: 0, total_order: 25.99, currency_code: 'EUR' })],
        },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          href="https://demo.api/hapi/subscriptions/0"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      await waitUntil(() => !!element.headerTitleOptions.context, '', { timeout: 10000 });

      expect(element.headerTitleOptions).to.deep.equal({
        currencyDisplay: 'symbol',
        context: 'twice_a_month',
        amount: '25.99 EUR',
        units: 'monthly',
        count: 0.5,
      });
    });

    it('once loaded, renders price and frequency in title (currency in custom template set)', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: {
          property_helpers: [
            {
              id: 0,
              values: { en_AU: 'English locale for Australia (Currency: AUD:$)' },
              message: '',
            },
          ],
          subscriptions: [fromDefaults('subscriptions', { id: 0, frequency: '3w' })],
          template_sets: [fromDefaults('template_sets', { id: 0, locale_code: 'en_AU' })],
          stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
          carts: [
            fromDefaults('carts', {
              id: 0,
              total_order: 25.99,
              template_set_id: 0,
              template_set_uri: 'https://demo.api/hapi/template_sets/0',
            }),
          ],
        },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          locale-codes="https://demo.api/hapi/property_helpers/0"
          href="https://demo.api/hapi/subscriptions/0"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      await waitUntil(() => !!element.headerTitleOptions.context, '', { timeout: 10000 });

      expect(element.headerTitleOptions).to.deep.equal({
        currencyDisplay: 'code',
        context: 'recurring',
        amount: '25.99 AUD',
        units: 'weekly',
        count: 3,
      });
    });

    it('once loaded, renders price and frequency in title (currency in default template set)', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: {
          property_helpers: [
            {
              id: 0,
              values: { en_AU: 'English locale for Australia (Currency: AUD:$)' },
              message: '',
            },
          ],
          subscriptions: [fromDefaults('subscriptions', { id: 0, frequency: '3w' })],
          template_sets: [
            fromDefaults('template_sets', { id: 123, code: 'DEFAULT', locale_code: 'en_AU' }),
          ],
          stores: [fromDefaults('stores', { id: 0, use_international_currency_symbol: true })],
          carts: [fromDefaults('carts', { id: 0, total_order: 25.99 })],
        },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          locale-codes="https://demo.api/hapi/property_helpers/0"
          href="https://demo.api/hapi/subscriptions/0"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      await waitUntil(() => !!element.headerTitleOptions.context, '', { timeout: 10000 });

      expect(element.headerTitleOptions).to.deep.equal({
        currencyDisplay: 'code',
        context: 'recurring',
        amount: '25.99 AUD',
        units: 'weekly',
        count: 3,
      });
    });

    it('uses custom subtitle key based on the subscription status', async () => {
      const testData = await getTestData<Data>('./hapi/subscriptions/0');
      const status = getSubscriptionStatus(testData);

      const form = new Form();
      form.data = testData;

      expect(form.headerSubtitleKey).to.equal(`subtitle_${status}`);
    });
  });

  describe('customer', () => {
    it('is hidden when form is hidden', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data} hidden></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);

      expect(await getByTestId(element, 'customer')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "customer"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} hiddencontrols="customer"> </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'customer')).not.to.exist;
    });

    it('renders "customer:before" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const slot = await getByName(element, 'customer:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "customer:before" slot with template "customer:before" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'customer:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "customer:after" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const slot = await getByName(element, 'customer:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "customer:after" slot with template "customer:after" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'customer:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders foxy-i18n label with key "label" when visible', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form lang="es" .data=${data}> </foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'customer'))!;
      const label = await getByKey(control, 'label');

      expect(label).to.exist;
      expect(label).to.have.attribute('infer', 'customer');
    });

    it('renders plain customer card when .getCustomerPageHref is not set', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'customer'))!;
      const card = (await getByTag(control, 'foxy-customer-card'))!;
      const link = card.closest('a');

      expect(card).to.exist;
      expect(card).to.have.attribute('infer', 'customer');
      expect(card).to.have.attribute('href', data._links['fx:customer'].href);

      expect(link).to.exist;
      expect(link).to.not.have.attribute('href');
    });

    it('renders clickable customer card when .getCustomerPageHref is set', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .getCustomerPageHref=${(href: string) => `https://example.com?from=${href}`}
          .data=${data}
        >
        </foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'customer'))!;
      const card = (await getByTag(control, 'foxy-customer-card'))!;
      const link = card.closest('a');

      expect(card).to.exist;
      expect(card).to.have.attribute('infer', 'customer');
      expect(card).to.have.attribute('href', data._links['fx:customer'].href);

      expect(link).to.exist;
      expect(link).to.have.attribute(
        'href',
        `https://example.com?from=${data._links['fx:customer'].href}`
      );
    });
  });

  describe('items', () => {
    it('once loaded, renders subscription items', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: {
          subscriptions: [fromDefaults('subscriptions', { id: 0 })],
          stores: [fromDefaults('stores', { id: 0 })],
          carts: [fromDefaults('carts', { id: 0 })],
        },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          locale-codes="https://demo.api/hapi/property_helpers/7"
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      await waitUntil(
        () => {
          const control = element.renderRoot.querySelector('[infer="items"]');
          return !!control?.hasAttribute('first');
        },
        '',
        {
          timeout: 10000,
        }
      );

      const items = (await getByTestId(element, 'items'))!;
      const control = items.querySelector('[infer="items"]')!;

      expect(control).to.have.property('localName', 'foxy-internal-async-list-control');
      expect(control).to.have.deep.property('itemProps', { 'locale-codes': element.localeCodes });
      expect(control).to.have.attribute('item', 'foxy-item-card');
      expect(control).to.have.attribute(
        'first',
        'https://demo.api/hapi/items?cart_id=0&zoom=item_options'
      );
    });

    it('is visible by default', async () => {
      const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);

      expect(await getByTestId(element, 'items')).to.exist;
    });

    it('is hidden when form is hidden', async () => {
      const layout = html`<foxy-subscription-form hidden></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);

      expect(await getByTestId(element, 'items')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "items"', async () => {
      const element = await fixture<Form>(html`
        <foxy-subscription-form hiddencontrols="items"></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'items')).not.to.exist;
    });

    describe('actions', () => {
      it('renders foxy-i18n label with key "item_plural"', async () => {
        const layout = html`<foxy-subscription-form lang="es"></foxy-subscription-form>`;
        const element = await fixture<Form>(layout);
        const control = await getByTestId(element, 'items:actions-label');

        expect(control).to.have.property('localName', 'foxy-i18n');
        expect(control).to.have.attribute('lang', 'es');
        expect(control).to.have.attribute('key', 'item_plural');
        expect(control).to.have.attribute('ns', 'subscription-form');
      });

      it('is visible by default', async () => {
        const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
        const element = await fixture<Form>(layout);
        expect(await getByTestId(element, 'items:actions')).to.exist;
      });

      it('is hidden when form is hidden', async () => {
        const layout = html`<foxy-subscription-form hidden></foxy-subscription-form>`;
        const element = await fixture<Form>(layout);
        expect(await getByTestId(element, 'items:actions')).not.to.exist;
      });

      it('is hidden when hiddencontrols includes "items:actions"', async () => {
        const element = await fixture<Form>(html`
          <foxy-subscription-form hiddencontrols="items:actions"></foxy-subscription-form>
        `);

        expect(await getByTestId(element, 'items:actions')).not.to.exist;
      });

      it('renders "items:actions:before" slot by default', async () => {
        const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
        const element = await fixture<Form>(layout);
        const slot = await getByName(element, 'items:actions:before');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "items:actions:before" slot with template "items:actions:before" if available', async () => {
        const name = 'items:actions:before';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Form>(html`
          <foxy-subscription-form>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-subscription-form>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });

      it('renders "items:actions:after" slot by default', async () => {
        const layout = html`<foxy-subscription-form></foxy-subscription-form>`;
        const element = await fixture<Form>(layout);
        const slot = await getByName(element, 'items:actions:after');

        expect(slot).to.have.property('localName', 'slot');
      });

      it('replaces "items:actions:after" slot with template "items:actions:after" if available', async () => {
        const name = 'items:actions:after';
        const value = `<p>Value of the "${name}" template.</p>`;
        const element = await fixture<Form>(html`
          <foxy-subscription-form>
            <template slot=${name}>${unsafeHTML(value)}</template>
          </foxy-subscription-form>
        `);

        const slot = await getByName<HTMLSlotElement>(element, name);
        const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

        expect(slot).to.not.exist;
        expect(sandbox).to.contain.html(value);
      });
    });
  });

  describe('frequency', () => {
    it('is hidden when form is hidden', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data} hidden></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "frequency"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} hiddencontrols="frequency"> </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('is hidden when settings are present but the form is still loading data', async () => {
      const element = await fixture<Form>(html`
        <foxy-subscription-form href="/" .settings=${{}}></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('is hidden if settings prohibit frequency modification', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${await getTestData(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [],
              allow_next_date_modification: false,
            },
          }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('is hidden when subscription is inactive', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${{ ...(await getTestData<Data>(href)), is_active: false }}>
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('is hidden when subscription has ended', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${{ ...(await getTestData<Data>(href)), end_date: '2012-08-10T11:58:54-0700' }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'frequency')).not.to.exist;
    });

    it('renders "frequency:before" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const slot = await getByName(element, 'frequency:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "frequency:before" slot with template "frequency:before" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'frequency:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "frequency:after" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const slot = await getByName(element, 'frequency:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "frequency:after" slot with template "frequency:after" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'frequency:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('when visible, renders radio list with common options by default', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const label = await getByKey(element, 'frequency_label');
      const list = await getByTestId(element, 'frequency');

      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'subscription-form');

      expect(list).to.be.instanceOf(Choice);
      expect(list).to.have.attribute('type', 'frequency');
      expect(list).to.have.attribute('custom');
      expect(list).to.have.deep.property('items', ['.5m', '1m', '1y']);

      ['.5m', '1m', '1y'].forEach((frequency, index) => {
        const item = list!.children[index];

        expect(item).to.have.property('localName', 'foxy-i18n');
        expect(item).to.have.attribute('options', JSON.stringify(parseFrequency(frequency)));
        expect(item).to.have.attribute('slot', `${frequency}-label`);
        expect(item).to.have.attribute('lang', 'es');
        expect(item).to.have.attribute('key', frequency === '.5m' ? 'twice_a_month' : 'frequency');
      });
    });

    it('when visible, renders radio list if settings have up to 4 frequency options', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const values = ['1y', '1m', '.5m', '1w'];
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [{ jsonata_query: '*', values }],
              allow_next_date_modification: [],
            },
          }}
        >
        </foxy-subscription-form>
      `);

      const list = await getByTestId(element, 'frequency');

      expect(list).to.be.instanceOf(Choice);
      expect(list).to.have.attribute('type', 'frequency');
      expect(list).not.to.have.attribute('custom');
      expect(list).to.have.deep.property('items', values);

      values.forEach((frequency, index) => {
        const item = list!.children[index];

        expect(item).to.have.property('localName', 'foxy-i18n');
        expect(item).to.have.attribute('options', JSON.stringify(parseFrequency(frequency)));
        expect(item).to.have.attribute('slot', `${frequency}-label`);
        expect(item).to.have.attribute('key', frequency === '.5m' ? 'twice_a_month' : 'frequency');
      });
    });

    it('when visible, renders dropdown if settings have 5+ frequency options', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const values = ['2y', '1y', '4m', '2w', '5d'];
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [{ jsonata_query: '*', values }],
              allow_next_date_modification: [],
            },
          }}
        >
        </foxy-subscription-form>
      `);

      const dropdown = await getByTestId(element, 'frequency');
      const items = values.map(value => ({ label: 'frequency', value }));

      expect(dropdown).to.be.instanceOf(ComboBoxElement);
      expect(dropdown).to.have.attribute('label', 'frequency_label');
      expect(dropdown).to.have.attribute('item-value-path', 'value');
      expect(dropdown).to.have.attribute('item-label-path', 'label');
      expect(dropdown).to.have.deep.property('items', items);
    });

    it('binds radio list value to form.frequency', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = { ...(await getTestData<Data>(href)), frequency: '3y' };
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const list = await getByTestId<Choice>(element, 'frequency');

      expect(list).to.have.property('value', '3y');

      list!.value = '.5m';
      list!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.frequency', '.5m');
    });

    it('binds dropdown value to form.frequency', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const values = ['2y', '1y', '4m', '2w', '5d'];
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${{ ...(await getTestData<Data>(href)), frequency: '4m' }}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [{ jsonata_query: '*', values }],
              allow_next_date_modification: [],
            },
          }}
        >
        </foxy-subscription-form>
      `);

      const dropdown = await getByTestId<ComboBoxElement>(element, 'frequency');

      expect(dropdown).to.have.property('value', '4m');

      dropdown!.value = '1y';
      dropdown!.dispatchEvent(new CustomEvent('change'));

      expect(element).to.have.nested.property('form.frequency', '1y');
    });

    [
      ['1y', '1m', '1w', '1d'],
      ['1y', '1m', '.5m', '1w', '1d'],
    ].forEach(values => {
      const target = values.length > 4 ? 'dropdown' : 'radio list';
      const settings = {
        subscriptions: {
          allow_frequency_modification: [{ jsonata_query: '*', values }],
          allow_next_date_modification: [],
        },
      };

      it(`${target} is disabled if form is disabled`, async () => {
        const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
        const element = await fixture<Form>(html`
          <foxy-subscription-form
            disabled
            .data=${{ ...(await getTestData<Data>(href)), frequency: '4m' }}
            .settings=${settings}
          >
          </foxy-subscription-form>
        `);

        expect(await getByTestId(element, 'frequency')).to.have.attribute('disabled');
      });

      it(`${target} is disabled if disabledcontrols includes "frequency"`, async () => {
        const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
        const element = await fixture<Form>(html`
          <foxy-subscription-form
            disabledcontrols="frequency"
            .data=${{ ...(await getTestData<Data>(href)), frequency: '4m' }}
            .settings=${settings}
          >
          </foxy-subscription-form>
        `);

        expect(await getByTestId(element, 'frequency')).to.have.attribute('disabled');
      });

      it(`${target} is readonly if form is readonly`, async () => {
        const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
        const element = await fixture<Form>(html`
          <foxy-subscription-form
            readonly
            .data=${{ ...(await getTestData<Data>(href)), frequency: '4m' }}
            .settings=${settings}
          >
          </foxy-subscription-form>
        `);

        expect(await getByTestId(element, 'frequency')).to.have.attribute('readonly');
      });

      it(`${target} is readonly if readonlycontrols includes "frequency"`, async () => {
        const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
        const element = await fixture<Form>(html`
          <foxy-subscription-form
            readonlycontrols="frequency"
            .data=${{ ...(await getTestData<Data>(href)), frequency: '4m' }}
            .settings=${settings}
          >
          </foxy-subscription-form>
        `);

        expect(await getByTestId(element, 'frequency')).to.have.attribute('readonly');
      });
    });
  });

  describe('start-date', () => {
    it('is hidden when form is hidden', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data} hidden></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);

      expect(await getByTestId(element, 'start-date')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "start-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} hiddencontrols="start-date"> </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'start-date')).not.to.exist;
    });

    it('is hidden when settings are present but the form is still loading data', async () => {
      const element = await fixture<Form>(html`
        <foxy-subscription-form href="/" .settings=${{}}></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'start-date')).not.to.exist;
    });

    it('is hidden if settings prohibit next date modification', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${await getTestData(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [],
              allow_next_date_modification: false,
            },
          }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'start-date')).not.to.exist;
    });

    it('is hidden when subscription is inactive', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${{ ...(await getTestData<Data>(href)), is_active: false }}>
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'start-date')).not.to.exist;
    });

    it('is hidden when subscription has ended', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${{ ...(await getTestData<Data>(href)), end_date: '2012-08-10T11:58:54-0700' }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'start-date')).not.to.exist;
    });

    it('renders "start-date:before" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const slot = await getByName(element, 'start-date:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "start-date:before" slot with template "start-date:before" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'start-date:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "start-date:after" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const slot = await getByName(element, 'start-date:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "start-date:after" slot with template "start-date:after" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'start-date:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders foxy-i18n label with key "start_date" when visible', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form lang="es" .data=${data}> </foxy-subscription-form>
      `);

      const label = await getByKey(element, 'start_date');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'subscription-form');
    });

    it('when visible, renders foxy-internal-calendar bound to form.start_date', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      data.start_date = new Date(Date.now() + 84600000).toISOString();
      const element = await fixture<Form>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'start-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('lang', 'es');
      expect(calendar).to.have.attribute('value', data.start_date);
      expect(calendar).to.have.attribute('start', data.start_date.substr(0, 10));

      const newValue = new Date(Date.now() + 172800000).toISOString();
      calendar!.value = newValue;
      calendar!.dispatchEvent(new CustomEvent('change'));

      expect(element.form).to.have.property('start_date', newValue);
    });

    it('is disabled when the form is disabled', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} disabled></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'start-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes "start-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          disabledcontrols="start-date"
        >
        </foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'start-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('disabled');
    });

    it('is readonly when the form is disabled', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} readonly></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'start-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes "start-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          readonlycontrols="start-date"
        >
        </foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'start-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('readonly');
    });

    it('disables past dates if no settings were provided', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${await getTestData<Data>(href)}></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'start-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar!.checkAvailability(new Date(Date.now() - 84600000))).to.be.false;
    });
  });

  describe('next-transaction-date', () => {
    it('is hidden when form is hidden', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data} hidden></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "next-transaction-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} hiddencontrols="next-transaction-date">
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('is hidden when settings are present but the form is still loading data', async () => {
      const element = await fixture<Form>(html`
        <foxy-subscription-form href="/" .settings=${{}}></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('is hidden if settings prohibit next date modification', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${await getTestData(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [],
              allow_next_date_modification: false,
            },
          }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('is hidden when subscription is inactive', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${{ ...(await getTestData<Data>(href)), is_active: false }}>
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('is hidden when subscription has ended', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${{ ...(await getTestData<Data>(href)), end_date: '2012-08-10T11:58:54-0700' }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'next-transaction-date')).not.to.exist;
    });

    it('renders "next-transaction-date:before" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const slot = await getByName(element, 'next-transaction-date:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "next-transaction-date:before" slot with template "next-transaction-date:before" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'next-transaction-date:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "next-transaction-date:after" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const slot = await getByName(element, 'next-transaction-date:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "next-transaction-date:after" slot with template "next-transaction-date:after" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'next-transaction-date:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders foxy-i18n label with key "next_transaction_date" when visible', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form lang="es" .data=${data}> </foxy-subscription-form>
      `);

      const label = await getByKey(element, 'next_transaction_date');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'subscription-form');
    });

    it('when visible, renders foxy-internal-calendar bound to form.next_transaction_date', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      data.next_transaction_date = new Date(Date.now() + 84600000).toISOString();
      const element = await fixture<Form>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'next-transaction-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('lang', 'es');
      expect(calendar).to.have.attribute('value', data.next_transaction_date);
      expect(calendar).to.have.attribute('start', data.next_transaction_date.substr(0, 10));

      const newValue = new Date(Date.now() + 172800000).toISOString();
      calendar!.value = newValue;
      calendar!.dispatchEvent(new CustomEvent('change'));

      expect(element.form).to.have.property('next_transaction_date', newValue);
    });

    it('is disabled when the form is disabled', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} disabled></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'next-transaction-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes "next-transaction-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          disabledcontrols="next-transaction-date"
        >
        </foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'next-transaction-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('disabled');
    });

    it('is readonly when the form is disabled', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} readonly></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'next-transaction-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes "next-transaction-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          readonlycontrols="next-transaction-date"
        >
        </foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'next-transaction-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('readonly');
    });

    it('disables dates matching rules in the settings, if provided', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${await getTestData<Data>(href)}
          .settings=${{
            subscriptions: {
              allow_frequency_modification: [],
              allow_next_date_modification: [{ jsonata_query: '*', min: '1y' }],
            },
          }}
        >
        </foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'next-transaction-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar!.checkAvailability(new Date(Date.now() + 84600000))).to.be.false;
    });

    it('disables past dates if no settings were provided', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${await getTestData<Data>(href)}></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'next-transaction-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar!.checkAvailability(new Date(Date.now() - 84600000))).to.be.false;
    });
  });

  describe('end-date', () => {
    it('is hidden when form is hidden', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data} hidden></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);

      expect(await getByTestId(element, 'end-date')).not.to.exist;
    });

    it('is hidden when hiddencontrols includes "end-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} hiddencontrols="end-date"> </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'end-date')).not.to.exist;
    });

    it('is hidden when settings are present', async () => {
      const element = await fixture<Form>(html`
        <foxy-subscription-form href="/" .settings=${{}}></foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'end-date')).not.to.exist;
    });

    it('is hidden when subscription is inactive', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${{ ...(await getTestData<Data>(href)), is_active: false }}>
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'end-date')).not.to.exist;
    });

    it('is hidden when subscription has ended', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          .data=${{ ...(await getTestData<Data>(href)), end_date: '2012-08-10T11:58:54-0700' }}
        >
        </foxy-subscription-form>
      `);

      expect(await getByTestId(element, 'end-date')).not.to.exist;
    });

    it('renders "end-date:before" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const slot = await getByName(element, 'end-date:before');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "end-date:before" slot with template "end-date:before" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'end-date:before';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders "end-date:after" slot when appropriate', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const slot = await getByName(element, 'end-date:after');

      expect(slot).to.have.property('localName', 'slot');
    });

    it('replaces "end-date:after" slot with template "end-date:after" if available', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const name = 'end-date:after';
      const value = `<p>Value of the "${name}" template.</p>`;
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data}>
          <template slot=${name}>${unsafeHTML(value)}</template>
        </foxy-subscription-form>
      `);

      const slot = await getByName<HTMLSlotElement>(element, name);
      const sandbox = (await getByTestId<InternalSandbox>(element, name))!.renderRoot;

      expect(slot).to.not.exist;
      expect(sandbox).to.contain.html(value);
    });

    it('renders foxy-i18n label with key "end_date" when visible', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form lang="es" .data=${data}> </foxy-subscription-form>
      `);

      const label = await getByKey(element, 'end_date');

      expect(label).to.exist;
      expect(label).to.have.attribute('lang', 'es');
      expect(label).to.have.attribute('ns', 'subscription-form');
    });

    it('when visible, renders foxy-internal-calendar bound to form.end_date', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      data.end_date = new Date(Date.now() + 84600000).toISOString();
      const element = await fixture<Form>(html`
        <foxy-subscription-form lang="es" .data=${data}></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'end-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('lang', 'es');
      expect(calendar).to.have.attribute('value', data.end_date);
      expect(calendar).to.have.attribute('start', data.end_date.substr(0, 10));

      const newValue = new Date(Date.now() + 172800000).toISOString();
      calendar!.value = newValue;
      calendar!.dispatchEvent(new CustomEvent('change'));

      expect(element.form).to.have.property('end_date', newValue);
    });

    it('is disabled when the form is disabled', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} disabled></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'end-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('disabled');
    });

    it('is disabled when disabledcontrols includes "end-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${await getTestData<Data>(href)} disabledcontrols="end-date">
        </foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'end-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('disabled');
    });

    it('is readonly when the form is disabled', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData<Data>(href);
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${data} readonly></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'end-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('readonly');
    });

    it('is readonly when readonlycontrols includes "end-date"', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${await getTestData<Data>(href)} readonlycontrols="end-date">
        </foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'end-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar).to.have.attribute('readonly');
    });

    it('disables past dates', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const element = await fixture<Form>(html`
        <foxy-subscription-form .data=${await getTestData<Data>(href)}></foxy-subscription-form>
      `);

      const control = (await getByTestId(element, 'end-date'))!;
      const calendar = await getByTag<InternalCalendar>(control, 'foxy-internal-calendar');

      expect(calendar!.checkAvailability(new Date(Date.now() - 84600000))).to.be.false;
    });
  });

  describe('past-due-amount', () => {
    it('renders number control (currency comes from transaction template)', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: {
          subscriptions: [fromDefaults('subscriptions', { id: 0 })],
          stores: [fromDefaults('stores', { id: 0 })],
          carts: [fromDefaults('carts', { id: 0, currency_code: 'EUR' })],
        },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      const control = element.renderRoot.querySelector('[infer="past-due-amount"]');
      await waitUntil(() => !!control?.hasAttribute('suffix'), '', { timeout: 10000 });

      expect(control).to.be.instanceOf(InternalNumberControl);
      expect(control).to.have.attribute('suffix', 'EUR');
      expect(control).to.have.attribute('min', '0');
    });

    it('renders number control (currency comes from custom template set)', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: {
          property_helpers: [
            {
              id: 0,
              values: { en_AU: 'English locale for Australia (Currency: AUD:$)' },
              message: '',
            },
          ],
          subscriptions: [fromDefaults('subscriptions', { id: 0 })],
          template_sets: [fromDefaults('template_sets', { id: 0, locale_code: 'en_AU' })],
          stores: [fromDefaults('stores', { id: 0 })],
          carts: [
            fromDefaults('carts', {
              id: 0,
              template_set_id: 0,
              template_set_uri: 'https://demo.api/hapi/template_sets/0',
            }),
          ],
        },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          locale-codes="https://demo.api/hapi/property_helpers/0"
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      const control = element.renderRoot.querySelector('[infer="past-due-amount"]');
      await waitUntil(() => !!control?.hasAttribute('suffix'), '', { timeout: 10000 });

      expect(control).to.be.instanceOf(InternalNumberControl);
      expect(control).to.have.attribute('suffix', 'AUD');
      expect(control).to.have.attribute('min', '0');
    });

    it('renders number control (currency comes from default template set)', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: {
          property_helpers: [
            {
              id: 0,
              values: { en_AU: 'English locale for Australia (Currency: AUD:$)' },
              message: '',
            },
          ],
          subscriptions: [fromDefaults('subscriptions', { id: 0 })],
          template_sets: [
            fromDefaults('template_sets', { id: 0, code: 'DEFAULT', locale_code: 'en_AU' }),
          ],
          stores: [fromDefaults('stores', { id: 0 })],
          carts: [fromDefaults('carts', { id: 0 })],
        },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          locale-codes="https://demo.api/hapi/property_helpers/0"
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      const control = element.renderRoot.querySelector('[infer="past-due-amount"]');
      await waitUntil(() => !!control?.hasAttribute('suffix'), '', { timeout: 10000 });

      expect(control).to.be.instanceOf(InternalNumberControl);
      expect(control).to.have.attribute('suffix', 'AUD');
      expect(control).to.have.attribute('min', '0');
    });
  });

  describe('attributes', () => {
    it('renders async list control', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: { subscriptions: [fromDefaults('subscriptions', { id: 0 })] },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });
      const control = element.renderRoot.querySelector('[infer="attributes"]');

      expect(control).to.be.instanceOf(InternalAsyncListControl);
      expect(control).to.have.attribute(
        'first',
        'https://demo.api/hapi/subscription_attributes?subscription_id=0'
      );
      expect(control).to.have.attribute('limit', '5');
      expect(control).to.have.attribute('form', 'foxy-attribute-form');
      expect(control).to.have.attribute('item', 'foxy-attribute-card');
    });
  });

  describe('transactions', () => {
    it('renders async list control', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: { subscriptions: [fromDefaults('subscriptions', { id: 0 })] },
        links,
      });

      const getTransactionPageHref = () => '';
      const element = await fixture<Form>(html`
        <foxy-subscription-form
          href="https://demo.api/hapi/subscriptions/0"
          .getTransactionPageHref=${getTransactionPageHref}
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });
      const control = element.renderRoot.querySelector('[infer="transactions"]');

      expect(control).to.be.instanceOf(InternalAsyncListControl);
      expect(control).to.have.attribute(
        'first',
        'https://demo.api/hapi/transactions?subscription_id=0&order=transaction_date+desc&zoom=items'
      );
      expect(control).to.have.attribute('limit', '5');
      expect(control).to.have.attribute('item', 'foxy-transaction-card');
      expect(control).to.have.property('getPageHref', getTransactionPageHref);
    });
  });

  describe('timestamps', () => {
    it('renders timestamps control', async () => {
      const router = createBaseRouter({
        defaults,
        dataset: { subscriptions: [fromDefaults('subscriptions', { id: 0 })] },
        links,
      });

      const element = await fixture<Form>(html`
        <foxy-subscription-form
          href="https://demo.api/hapi/subscriptions/0"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `);

      await waitUntil(() => !!element.data, '', { timeout: 5000 });

      const control = element.renderRoot.querySelector('[infer="timestamps"]');
      expect(control).to.be.instanceOf(InternalTimestampsControl);
    });
  });

  describe('spinner', () => {
    it('renders foxy-spinner in "busy" state while loading data', async () => {
      const router = createRouter();
      const layout = html`
        <foxy-subscription-form
          href="https://demo.api/virtual/stall"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `;

      const element = await fixture<Form>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'busy');
      expect(spinner).to.have.attribute('infer', 'spinner');
    });

    it('renders foxy-spinner in "error" state if loading data fails', async () => {
      const router = createRouter();
      const layout = html`
        <foxy-subscription-form
          href="https://demo.api/virtual/empty?status=404"
          lang="es"
          @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
        >
        </foxy-subscription-form>
      `;

      const element = await fixture<Form>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');
      const spinner = spinnerWrapper!.firstElementChild;

      await waitUntil(() => element.in('fail'), undefined, { timeout: 5000 });

      expect(spinnerWrapper).not.to.have.class('opacity-0');
      expect(spinner).to.have.attribute('state', 'error');
      expect(spinner).to.have.attribute('infer', 'spinner');
    });

    it('hides spinner once loaded', async () => {
      const href = './hapi/subscriptions/0?zoom=last_transaction,transaction_template:items';
      const data = await getTestData(href);
      const layout = html`<foxy-subscription-form .data=${data}></foxy-subscription-form>`;
      const element = await fixture<Form>(layout);
      const spinnerWrapper = await getByTestId(element, 'spinner');

      expect(spinnerWrapper).to.have.class('opacity-0');
    });
  });
});
