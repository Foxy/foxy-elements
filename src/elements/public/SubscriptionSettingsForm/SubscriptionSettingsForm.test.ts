import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { SubscriptionSettingsForm as Form } from './SubscriptionSettingsForm';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import { InternalSummaryControl } from '../../internal/InternalSummaryControl/InternalSummaryControl';
import { InternalNumberControl } from '../../internal/InternalNumberControl/InternalNumberControl';
import { InternalSwitchControl } from '../../internal/InternalSwitchControl/InternalSwitchControl';
import { InternalSelectControl } from '../../internal/InternalSelectControl/InternalSelectControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';

describe('SubscriptionSettingsForm', () => {
  it('imports and defines foxy-internal-editable-list-control', () => {
    const constructor = customElements.get('foxy-internal-editable-list-control');
    expect(constructor).to.equal(InternalEditableListControl);
  });

  it('imports and defines foxy-internal-summary-control', () => {
    const constructor = customElements.get('foxy-internal-summary-control');
    expect(constructor).to.equal(InternalSummaryControl);
  });

  it('imports and defines foxy-internal-switch-control', () => {
    const constructor = customElements.get('foxy-internal-switch-control');
    expect(constructor).to.equal(InternalSwitchControl);
  });

  it('imports and defines foxy-internal-select-control', () => {
    const constructor = customElements.get('foxy-internal-select-control');
    expect(constructor).to.equal(InternalSelectControl);
  });

  it('imports and defines foxy-internal-number-control', () => {
    const constructor = customElements.get('foxy-internal-number-control');
    expect(constructor).to.equal(InternalNumberControl);
  });

  it('imports and defines foxy-internal-text-control', () => {
    const constructor = customElements.get('foxy-internal-text-control');
    expect(constructor).to.equal(InternalTextControl);
  });

  it('imports and defines foxy-internal-form', () => {
    const constructor = customElements.get('foxy-internal-form');
    expect(constructor).to.equal(InternalForm);
  });

  it('imports and defines itself as foxy-subscription-settings-form', () => {
    const constructor = customElements.get('foxy-subscription-settings-form');
    expect(constructor).to.equal(Form);
  });

  it('has a default i18next namespace "subscription-settings-form"', () => {
    expect(Form).to.have.property('defaultNS', 'subscription-settings-form');
    expect(new Form()).to.have.property('ns', 'subscription-settings-form');
  });

  it('extends foxy-internal-form', () => {
    expect(new Form()).to.be.instanceOf(InternalForm);
  });

  it('produces an error if expiring_soon_payment_reminder_schedule is too long', async () => {
    const form = new Form();

    form.data = await getTestData<Data>('./hapi/subscription_settings/0');
    expect(form.errors).to.not.include('expiring-soon-payment-reminder-schedule:v8n_too_long');

    form.edit({ expiring_soon_payment_reminder_schedule: 'A'.repeat(100) });
    expect(form.errors).to.not.include('expiring-soon-payment-reminder-schedule:v8n_too_long');

    form.edit({ expiring_soon_payment_reminder_schedule: 'A'.repeat(101) });
    expect(form.errors).to.include('expiring-soon-payment-reminder-schedule:v8n_too_long');
  });

  it('produces an error if reattempt_bypass_strings is too long', async () => {
    const form = new Form();

    form.data = await getTestData<Data>('./hapi/subscription_settings/0');
    expect(form.errors).to.not.include('reattempt-bypass-strings:v8n_too_long');

    form.edit({ reattempt_bypass_strings: 'A'.repeat(400) });
    expect(form.errors).to.not.include('reattempt-bypass-strings:v8n_too_long');

    form.edit({ reattempt_bypass_strings: 'A'.repeat(401) });
    expect(form.errors).to.include('reattempt-bypass-strings:v8n_too_long');
  });

  it('produces an error if reminder_email_schedule is too long', async () => {
    const form = new Form();

    form.data = await getTestData<Data>('./hapi/subscription_settings/0');
    expect(form.errors).to.not.include('reminder-email-schedule:v8n_too_long');

    form.edit({ reminder_email_schedule: 'A'.repeat(100) });
    expect(form.errors).to.not.include('reminder-email-schedule:v8n_too_long');

    form.edit({ reminder_email_schedule: 'A'.repeat(101) });
    expect(form.errors).to.include('reminder-email-schedule:v8n_too_long');
  });

  it('produces an error if reattempt_schedule is too long', async () => {
    const form = new Form();

    form.data = await getTestData<Data>('./hapi/subscription_settings/0');
    expect(form.errors).to.not.include('reattempt-schedule:v8n_too_long');

    form.edit({ reattempt_schedule: 'A'.repeat(100) });
    expect(form.errors).to.not.include('reattempt-schedule:v8n_too_long');

    form.edit({ reattempt_schedule: 'A'.repeat(101) });
    expect(form.errors).to.include('reattempt-schedule:v8n_too_long');
  });

  it('renders a form header', async () => {
    const form = new Form();
    const renderHeaderMethod = stub(form, 'renderHeader');
    form.render();
    expect(renderHeaderMethod).to.have.been.called;
  });

  it('always hides Copy ID button', () => {
    const form = new Form();
    expect(form.hiddenSelector.matches('header:copy-id', true)).to.be.true;
  });

  it('hides reattempt bypass strings control if reattempt bypass is off', async () => {
    const form = new Form();
    const scope = 'reattempts-group:reattempt-bypass-strings';

    form.data = await getTestData<Data>('./hapi/subscription_settings/0');
    form.edit({ reattempt_bypass_logic: '' });
    expect(form.hiddenSelector.matches(scope, true)).to.be.true;

    form.edit({ reattempt_bypass_logic: 'skip_if_exists' });
    expect(form.hiddenSelector.matches(scope, true)).to.be.false;
  });

  it('renders a summary control for past due amount settings', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="past-due-amount-group"]');
    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders a select control with past due amount handling options', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="past-due-amount-group"] [infer="past-due-amount-handling"]'
    );

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { label: 'option_increment', value: 'increment' },
      { label: 'option_replace', value: 'replace' },
    ]);
  });

  it('renders a switch controlling automatic past due charging', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="past-due-amount-group"] [infer="automatically-charge-past-due-amount"]'
    );

    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control).to.have.attribute('helper-text-as-tooltip');
  });

  it('renders a switch controlling resetting next date on makeup payment', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="past-due-amount-group"] [infer="reset-nextdate-on-makeup-payment"]'
    );

    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control).to.have.attribute('helper-text-as-tooltip');
  });

  it('renders a switch controlling preventing customer cancel with past due', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="past-due-amount-group"] [infer="prevent-customer-cancel-with-past-due"]'
    );

    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control).to.have.attribute('helper-text-as-tooltip');
  });

  it('renders a summary control for reattempt settings', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="reattempts-group"]');
    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders a select control with reattempt bypass logic options', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    const control = element.renderRoot.querySelector(
      '[infer="reattempts-group"] [infer="reattempt-bypass-logic"]'
    );

    expect(control).to.be.instanceOf(InternalSelectControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('options', [
      { value: '', label: 'option_always_reattempt' },
      { value: 'skip_if_exists', label: 'option_skip_if_exists' },
      { value: 'reattempt_if_exists', label: 'option_reattempt_if_exists' },
    ]);
  });

  it('renders a reattempt bypass strings list control', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        ns="subscription-settings-form"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalEditableListControl>(
      '[infer="reattempts-group"] [infer="reattempt-bypass-strings"]'
    );

    expect(control).to.be.instanceOf(InternalEditableListControl);
    expect(control).to.have.property('layout', 'summary-item');

    element.edit({ reattempt_bypass_strings: 'foo, bar, baz' });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([
      { value: 'foo' },
      { value: 'bar' },
      { value: 'baz' },
    ]);

    control?.setValue([{ value: 'qux' }, { value: 'quux' }]);
    expect(element).to.have.nested.property('form.reattempt_bypass_strings', 'qux,quux');
  });

  it('renders a reattempt schedule list control', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalEditableListControl>(
      '[infer="reattempts-group"] [infer="reattempt-schedule"]'
    );

    expect(control).to.be.instanceOf(InternalEditableListControl);
    expect(control).to.have.deep.property('inputParams', {
      type: 'number',
      step: '1',
      min: '0',
    });

    element.edit({ reattempt_schedule: '1, 3, 5' });
    await element.requestUpdate();

    expect(control?.getValue()).to.deep.equal([
      { value: '1', label: 'day' },
      { value: '3', label: 'day' },
      { value: '5', label: 'day' },
    ]);

    control?.setValue([{ value: '8' }, { value: '20' }]);
    expect(element).to.have.nested.property('form.reattempt_schedule', '8,20');
  });

  it('renders a summary control for email settings', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        ns="subscription-settings-form"
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="emails-group"]');
    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders a reminder email schedule list control', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalEditableListControl>(
      '[infer="emails-group"] [infer="reminder-email-schedule"]'
    );

    expect(control).to.be.instanceOf(InternalEditableListControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('inputParams', {
      type: 'number',
      step: '1',
      min: '0',
    });

    element.edit({ reminder_email_schedule: '1, 3, 5' });
    await element.requestUpdate();

    expect(control?.getValue()).to.deep.equal([
      { value: '1', label: 'day' },
      { value: '3', label: 'day' },
      { value: '5', label: 'day' },
    ]);

    control?.setValue([{ value: '8' }, { value: '20' }]);
    expect(element).to.have.nested.property('form.reminder_email_schedule', '8,20');
  });

  it('renders a payment method expiry email schedule list control', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalEditableListControl>(
      '[infer="emails-group"] [infer="expiring-soon-payment-reminder-schedule"]'
    );

    expect(control).to.be.instanceOf(InternalEditableListControl);
    expect(control).to.have.attribute('layout', 'summary-item');
    expect(control).to.have.deep.property('inputParams', {
      type: 'number',
      step: '1',
      min: '0',
    });

    element.edit({ expiring_soon_payment_reminder_schedule: '1, 3, 5' });
    await element.requestUpdate();

    expect(control?.getValue()).to.deep.equal([
      { value: '5', label: 'day' },
      { value: '3', label: 'day' },
      { value: '1', label: 'day' },
    ]);

    control?.setValue([{ value: '8' }, { value: '20' }]);
    expect(element).to.have.nested.property('form.expiring_soon_payment_reminder_schedule', '8,20');
  });

  it('renders a checkbox controlling email receipts for automated billing', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalSwitchControl>(
      '[infer="emails-group"] [infer="send-email-receipts-for-automated-billing"]'
    );

    expect(control).to.be.instanceOf(InternalSwitchControl);
    expect(control).to.have.attribute('helper-text-as-tooltip');
  });

  it('renders a summary control for modification settings', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        ns="subscription-settings-form"
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="modification-group"]');
    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders a text control for modification url', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector(
      '[infer="modification-group"] [infer="modification-url"]'
    );

    expect(control).to.be.instanceOf(InternalTextControl);
    expect(control).to.have.attribute('layout', 'summary-item');
  });

  it('renders a summary control for cancellation settings', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        ns="subscription-settings-form"
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="cancellation-group"]');
    expect(control).to.be.instanceOf(InternalSummaryControl);
  });

  it('renders a number control for cancellation schedule', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalNumberControl>(
      '[infer="cancellation-group"] [infer="cancellation-schedule"]'
    );

    expect(control).to.be.instanceOf(InternalNumberControl);
    expect(control).to.have.attribute('step', '1');
    expect(control).to.have.attribute('min', '1');

    element.edit({ cancellation_schedule: 0 });
    await element.requestUpdate();
    expect(control).to.have.attribute('suffix', '');

    element.edit({ cancellation_schedule: 7 });
    await element.requestUpdate();
    expect(control).to.have.attribute('suffix', 'day_suffix');
  });
});
