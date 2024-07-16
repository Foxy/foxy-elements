import type { FetchEvent } from '../NucleonElement/FetchEvent';
import type { Data } from './types';

import './index';

import { InternalSubscriptionSettingsFormReattemptBypass } from './internal/InternalSubscriptionSettingsFormReattemptBypass/InternalSubscriptionSettingsFormReattemptBypass';
import { SubscriptionSettingsForm as Form } from './SubscriptionSettingsForm';
import { expect, fixture, html, waitUntil } from '@open-wc/testing';
import { InternalCheckboxGroupControl } from '../../internal/InternalCheckboxGroupControl/InternalCheckboxGroupControl';
import { InternalEditableListControl } from '../../internal/InternalEditableListControl/InternalEditableListControl';
import { InternalRadioGroupControl } from '../../internal/InternalRadioGroupControl/InternalRadioGroupControl';
import { InternalIntegerControl } from '../../internal/InternalIntegerControl/InternalIntegerControl';
import { InternalTextControl } from '../../internal/InternalTextControl/InternalTextControl';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { createRouter } from '../../../server';
import { getTestData } from '../../../testgen/getTestData';
import { stub } from 'sinon';

describe('SubscriptionSettingsForm', () => {
  it('imports and defines foxy-internal-checkbox-group-control', () => {
    const constructor = customElements.get('foxy-internal-checkbox-group-control');
    expect(constructor).to.equal(InternalCheckboxGroupControl);
  });

  it('imports and defines foxy-internal-editable-list-control', () => {
    const constructor = customElements.get('foxy-internal-editable-list-control');
    expect(constructor).to.equal(InternalEditableListControl);
  });

  it('imports and defines foxy-internal-radio-group-control', () => {
    const constructor = customElements.get('foxy-internal-radio-group-control');
    expect(constructor).to.equal(InternalRadioGroupControl);
  });

  it('imports and defines foxy-internal-integer-control', () => {
    const constructor = customElements.get('foxy-internal-integer-control');
    expect(constructor).to.equal(InternalIntegerControl);
  });

  it('imports and defines foxy-internal-text-control', () => {
    const constructor = customElements.get('foxy-internal-text-control');
    expect(constructor).to.equal(InternalTextControl);
  });

  it('imports and defines foxy-internal-form', () => {
    const constructor = customElements.get('foxy-internal-form');
    expect(constructor).to.equal(InternalForm);
  });

  it('imports and defines foxy-internal-subscription-settings-form-reattempt-bypass', () => {
    const tag = 'foxy-internal-subscription-settings-form-reattempt-bypass';
    const constructor = customElements.get(tag);
    expect(constructor).to.equal(InternalSubscriptionSettingsFormReattemptBypass);
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

  it('renders radio group with past due amount handling options', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="past-due-amount-handling"]');

    expect(control).to.be.instanceOf(InternalRadioGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_increment', value: 'increment' },
      { label: 'option_replace', value: 'replace' },
      { label: 'option_ignore', value: 'ignore' },
    ]);
  });

  it('renders a checkbox controlling automatic past due charging', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalCheckboxGroupControl>(
      '[infer="automatically-charge-past-due-amount"]'
    );

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({ automatically_charge_past_due_amount: false });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ automatically_charge_past_due_amount: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders a checkbox controlling clearing past due amounts on success when automatic past due charging is off', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.edit({
      automatically_charge_past_due_amount: false,
      clear_past_due_amounts_on_success: false,
    });

    await element.requestUpdate();

    const control = element.renderRoot.querySelector<InternalCheckboxGroupControl>(
      '[infer="clear-past-due-amounts-on-success"]'
    );

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ clear_past_due_amounts_on_success: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders a checkbox controlling resetting next date on makeup payment when automatic past due charging is off', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });

    element.edit({
      automatically_charge_past_due_amount: false,
      reset_nextdate_on_makeup_payment: false,
    });

    await element.requestUpdate();

    const control = element.renderRoot.querySelector<InternalCheckboxGroupControl>(
      '[infer="reset-nextdate-on-makeup-payment"]'
    );

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ reset_nextdate_on_makeup_payment: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders reattempt bypass settings control', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector('[infer="reattempt-bypass"]');

    expect(control).to.be.instanceOf(InternalSubscriptionSettingsFormReattemptBypass);
  });

  it('renders reattempt schedule list control', async () => {
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
      '[infer="reattempt-schedule"]'
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

  it('renders reminder email schedule list control', async () => {
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
      '[infer="reminder-email-schedule"]'
    );

    expect(control).to.be.instanceOf(InternalEditableListControl);
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

  it('renders payment method expiry email schedule list control', async () => {
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
      '[infer="expiring-soon-payment-reminder-schedule"]'
    );

    expect(control).to.be.instanceOf(InternalEditableListControl);
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
    const control = element.renderRoot.querySelector<InternalCheckboxGroupControl>(
      '[infer="send-email-receipts-for-automated-billing"]'
    );

    expect(control).to.be.instanceOf(InternalCheckboxGroupControl);
    expect(control).to.have.deep.property('options', [
      { label: 'option_checked', value: 'checked' },
    ]);

    element.edit({ send_email_receipts_for_automated_billing: false });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal([]);

    element.edit({ send_email_receipts_for_automated_billing: true });
    await element.requestUpdate();
    expect(control?.getValue()).to.deep.equal(['checked']);
  });

  it('renders an integer input for cancellation schedule', async () => {
    const router = createRouter();
    const element = await fixture<Form>(html`
      <foxy-subscription-settings-form
        href="https://demo.api/hapi/subscription_settings/0"
        @fetch=${(evt: FetchEvent) => router.handleEvent(evt)}
      >
      </foxy-subscription-settings-form>
    `);

    await waitUntil(() => !!element.data, '', { timeout: 5000 });
    const control = element.renderRoot.querySelector<InternalIntegerControl>(
      '[infer="cancellation-schedule"]'
    );

    expect(control).to.be.instanceOf(InternalIntegerControl);
    expect(control).to.have.property('min', 1);

    element.edit({ cancellation_schedule: 0 });
    await element.requestUpdate();
    expect(control).to.have.property('suffix', '');

    element.edit({ cancellation_schedule: 7 });
    await element.requestUpdate();
    expect(control).to.have.property('suffix', 'day_suffix');
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
    const control = element.renderRoot.querySelector('[infer="modification-url"]');

    expect(control).to.be.instanceOf(InternalTextControl);
  });
});
