import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import { html, expect, fixture, waitUntil } from '@open-wc/testing';
import { AdminSubscriptionForm as Form } from './AdminSubscriptionForm';

import { createRouter } from '../../../server/index';
import { getTestData } from '../../../testgen/getTestData';

import './index';

describe('AdminSubscriptionForm', () => {
  const OriginalResizeObserver = window.ResizeObserver;

  // @ts-expect-error disabling ResizeObserver because it errors in test env
  before(() => (window.ResizeObserver = undefined));
  after(() => (window.ResizeObserver = OriginalResizeObserver));

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

  it('imports and defines foxy-internal-admin-subscription-form-load-in-cart-action', () => {
    expect(customElements.get('foxy-internal-admin-subscription-form-load-in-cart-action')).to
      .exist;
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

  it('uses custom subtitle options based on the subscription status', async () => {
    const form = new Form();
    expect(form.headerSubtitleOptions).to.deep.equal({ context: 'inactive' });

    const testData = await getTestData<Data>('./hapi/subscriptions/0?zoom=transaction_template');
    testData.is_active = true;
    form.data = testData;
    expect(form.headerSubtitleOptions).to.deep.equal({ context: 'active' });

    testData.is_active = false;
    form.data = testData;
    expect(form.headerSubtitleOptions).to.deep.equal({ context: 'inactive' });
  });

  it('renders load in cart action for viewing the subscription in cart', async () => {
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
    const action = form.renderRoot.querySelector('[infer="view-action"]');
    expect(action?.localName).to.equal('foxy-internal-admin-subscription-form-load-in-cart-action');
  });

  it('renders load in cart action for cancelling the subscription', async () => {
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
    const action = form.renderRoot.querySelector('[infer="cancel-action"]');
    expect(action?.localName).to.equal('foxy-internal-admin-subscription-form-load-in-cart-action');
    expect(action?.getAttribute('action')).to.equal('cancel');
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
