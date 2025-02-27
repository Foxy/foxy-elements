import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import { html, expect, fixture, waitUntil } from '@open-wc/testing';
import { AdminSubscriptionForm as Form } from './AdminSubscriptionForm';
import { getSubscriptionStatus } from '../../../utils/get-subscription-status';
import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';

import './index';

describe('AdminSubscriptionForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

  it('imports and defines foxy-internal-post-action-control', () => {
    expect(customElements.get('foxy-internal-post-action-control')).to.exist;
  });

  it('imports and defines foxy-internal-async-list-control', () => {
    expect(customElements.get('foxy-internal-async-list-control')).to.exist;
  });

  it('imports and defines foxy-internal-frequency-control', () => {
    expect(customElements.get('foxy-internal-frequency-control')).to.exist;
  });

  it('imports and defines foxy-internal-number-control', () => {
    expect(customElements.get('foxy-internal-number-control')).to.exist;
  });

  it('imports and defines foxy-internal-date-control', () => {
    expect(customElements.get('foxy-internal-date-control')).to.exist;
  });

  it('imports and defines foxy-internal-form', () => {
    expect(customElements.get('foxy-internal-form')).to.exist;
  });

  it('imports and defines foxy-transaction-card', () => {
    expect(customElements.get('foxy-transaction-card')).to.exist;
  });

  it('imports and defines foxy-attribute-card', () => {
    expect(customElements.get('foxy-attribute-card')).to.exist;
  });

  it('imports and defines foxy-attribute-form', () => {
    expect(customElements.get('foxy-attribute-form')).to.exist;
  });

  it('imports and defines foxy-transaction', () => {
    expect(customElements.get('foxy-transaction')).to.exist;
  });

  it('imports and defines foxy-internal-admin-subscription-form-link-control', () => {
    expect(customElements.get('foxy-internal-admin-subscription-form-link-control')).to.exist;
  });

  it('imports and defines foxy-internal-admin-subscription-form-error', () => {
    expect(customElements.get('foxy-internal-admin-subscription-form-error')).to.exist;
  });

  it('defines itself as foxy-admin-subscription-form', () => {
    expect(customElements.get('foxy-admin-subscription-form')).to.equal(Form);
  });

  it('extends InternalForm', () => {
    expect(new Form()).to.be.instanceOf(customElements.get('foxy-internal-form'));
  });

  it('has a default i18next namespace "admin-subscription-form"', () => {
    expect(Form).to.have.property('defaultNS', 'admin-subscription-form');
    expect(new Form()).to.have.property('ns', 'admin-subscription-form');
  });

  it('has a reactive property "uoeSettingsPage" that defaults to null', () => {
    expect(new Form()).to.have.property('uoeSettingsPage', null);
    expect(Form.properties).to.have.deep.property('uoeSettingsPage', {
      attribute: 'uoe-settings-page',
    });
  });

  it('always hides built-in Delete button because subscriptions cannot be deleted', () => {
    expect(new Form().hiddenSelector.matches('delete', true)).to.be.true;
  });

  it('hides error message control when there is no error', async () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('error-message', true)).to.be.true;

    const testData = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
    testData.error_message = 'Test error';
    form.data = testData;
    expect(form.hiddenSelector.matches('error-message', true)).to.be.false;
  });

  it('hides View in cart and Cancel actions when there is no data', async () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('view-action', true)).to.be.true;
    expect(form.hiddenSelector.matches('cancel-action', true)).to.be.true;

    form.data = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
    expect(form.hiddenSelector.matches('view-action', true)).to.be.false;
    expect(form.hiddenSelector.matches('cancel-action', true)).to.be.false;
  });

  it('uses custom subtitle key based on the subscription status', async () => {
    const testData = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
    const status = getSubscriptionStatus(testData);

    const form = new Form();
    form.data = testData;

    expect(form.headerSubtitleKey).to.equal(`subtitle_${status}`);
  });

  it('renders error message control', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    const error = form.renderRoot.querySelector('[infer="error-message"]');
    expect(error?.localName).to.equal('foxy-internal-admin-subscription-form-error');
  });

  it('renders summary control with general information', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const control = form.renderRoot.querySelector('[infer="general"]');
    expect(control?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders date control for start date inside of the general summary control', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const summary = form.renderRoot.querySelector('[infer="general"]');
    const control = summary?.querySelector('[infer="start-date"]');

    expect(control?.localName).to.equal('foxy-internal-date-control');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders frequency control inside of the general summary control', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const summary = form.renderRoot.querySelector('[infer="general"]');
    const control = summary?.querySelector('[infer="frequency"]');

    expect(control?.localName).to.equal('foxy-internal-frequency-control');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('allow-twice-a-month');
  });

  it('renders date control for next transaction date inside of the general summary control', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const summary = form.renderRoot.querySelector('[infer="general"]');
    const control = summary?.querySelector('[infer="next-transaction-date"]');

    expect(control?.localName).to.equal('foxy-internal-date-control');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders date control for end date inside of the general summary control', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const summary = form.renderRoot.querySelector('[infer="general"]');
    const control = summary?.querySelector('[infer="end-date"]');

    expect(control?.localName).to.equal('foxy-internal-date-control');
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders summary control with overdue information', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const control = form.renderRoot.querySelector('[infer="overdue"]');
    expect(control?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders post action control for charging past due amount when appropriate', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    const testData = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
    // @ts-expect-error - SDK doesn't know yet about the `fx:charge_past_due` link.
    testData._links['fx:charge_past_due'] = { href: 'https://demo.api/virtual/empty' };
    testData.past_due_amount = 10;
    testData._embedded['fx:transaction_template'].currency_code = 'AUD';
    form.data = testData;

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const summary = form.renderRoot.querySelector('[infer="overdue"]');
    const control = summary?.querySelector('[infer="charge-past-due"]');

    expect(control?.localName).to.equal('foxy-internal-post-action-control');
    expect(control).to.have.attribute('theme', 'tertiary-inline');
    expect(control).to.have.attribute('message-options', JSON.stringify({ amount: '10 AUD' }));
    expect(control).to.have.attribute('href', 'https://demo.api/virtual/empty');
    expect(control).to.have.attribute('href', 'https://demo.api/virtual/empty');
  });

  it('renders number control for past due amount inside of the overdue summary control', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const summary = form.renderRoot.querySelector('[infer="overdue"]');
    const control = summary?.querySelector('[infer="past-due-amount"]');

    expect(control?.localName).to.equal('foxy-internal-number-control');
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.attribute('suffix', 'USD');
    expect(control).to.have.attribute('min', '0');
  });

  it('renders default slot', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();

    const slot = form.renderRoot.querySelector('slot:not([name])');
    expect(slot).to.exist;
  });

  it('renders summary control with self-service links', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    const control = form.renderRoot.querySelector('[infer="self-service-links"]');
    expect(control?.localName).to.equal('foxy-internal-summary-control');
  });

  it('renders internal link control for loading subscription in cart inside of the self-service links summary control', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    const summary = form.renderRoot.querySelector('[infer="self-service-links"]');
    const control = summary?.querySelector('[infer="load-in-cart"]');

    expect(control?.localName).to.equal('foxy-internal-admin-subscription-form-link-control');
    expect(control).to.not.have.attribute('search');
  });

  it('renders internal link control for loading subscription on checkout inside of the self-service links summary control', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    const summary = form.renderRoot.querySelector('[infer="self-service-links"]');
    const control = summary?.querySelector('[infer="load-on-checkout"]');

    expect(control?.localName).to.equal('foxy-internal-admin-subscription-form-link-control');
    expect(control).to.have.attribute('search', 'cart=checkout');
  });

  it('renders internal link control for canceling subscription at the end of the billing period inside of the self-service links summary control', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    const summary = form.renderRoot.querySelector('[infer="self-service-links"]');
    const control = summary?.querySelector('[infer="cancel-at-end-of-billing-period"]');

    expect(control?.localName).to.equal('foxy-internal-admin-subscription-form-link-control');
    expect(control).to.have.attribute('search', 'sub_cancel=next_transaction_date');
  });

  it('renders internal link control for canceling subscription on the next day inside of the self-service links summary control', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    const summary = form.renderRoot.querySelector('[infer="self-service-links"]');
    const control = summary?.querySelector('[infer="cancel-next-day"]');

    expect(control?.localName).to.equal('foxy-internal-admin-subscription-form-link-control');
    expect(control).to.have.attribute('search', 'sub_cancel=true');
  });

  it('renders link to UOE settings page when uoeSettingsPage is set', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        uoe-settings-page="https://example.com"
        href="https://demo.api/hapi/subscriptions/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    const summary = form.renderRoot.querySelector('[infer="self-service-links"]');
    expect(summary?.querySelector('a')).to.have.attribute('href', 'https://example.com');
  });

  it('renders async list control for attributes', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const control = form.renderRoot.querySelector('[infer="attributes"]');
    expect(control?.localName).to.equal('foxy-internal-async-list-control');

    expect(control).to.have.attribute('item', 'foxy-attribute-card');
    expect(control).to.have.attribute('form', 'foxy-attribute-form');
    expect(control).to.have.attribute('alert');
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/subscription_attributes?subscription_id=0'
    );
  });

  it('renders async list control for transactions', async () => {
    const router = createRouter();
    const form = await fixture<Form>(html`
      <foxy-admin-subscription-form
        href="https://demo.api/hapi/subscriptions/0?zoom=transaction_template"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-admin-subscription-form>
    `);

    await waitUntil(() => !!form.data, '', { timeout: 5000 });
    await form.requestUpdate();
    const control = form.renderRoot.querySelector('[infer="transactions"]');
    expect(control?.localName).to.equal('foxy-internal-async-list-control');

    expect(control).to.have.attribute('item', 'foxy-transaction-card');
    expect(control).to.have.attribute('form', 'foxy-transaction');
    expect(control).to.have.attribute('hide-create-button');
    expect(control).to.have.attribute('hide-delete-button');
    expect(control).to.have.attribute('alert');
    expect(control).to.have.attribute('wide');
    expect(control).to.have.attribute(
      'first',
      'https://demo.api/hapi/transactions?subscription_id=0&zoom=items'
    );
  });
});
