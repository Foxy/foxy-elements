import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Option } from '../../internal/InternalCheckboxGroupControl/types';
import type { Item } from '../../internal/InternalEditableListControl/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'subscription-settings-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for managing `fx:subscription_settings` resources.
 *
 * @element foxy-subscription-settings-form
 * @since 1.21.0
 */
export class SubscriptionSettingsForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ expiring_soon_payment_reminder_schedule: v }) => {
        return !v || v.length <= 100 || 'expiring-soon-payment-reminder-schedule:v8n_too_long';
      },
      ({ reattempt_bypass_strings: v }) => {
        return !v || v.length <= 400 || 'reattempt-bypass-strings:v8n_too_long';
      },
      ({ reminder_email_schedule: v }) => {
        return !v || v.length <= 100 || 'reminder-email-schedule:v8n_too_long';
      },
      ({ reattempt_schedule: v }) => {
        return !v || v.length <= 100 || 'reattempt-schedule:v8n_too_long';
      },
    ];
  }

  private __pastDueAmountHandlingOptions: Option[] = [
    { label: 'option_increment', value: 'increment' },
    { label: 'option_replace', value: 'replace' },
  ];

  private __positiveIntegerInputParams = {
    type: 'number',
    step: '1',
    min: '0',
  };

  private __expiringSoonPaymentReminderScheduleGetValue = () => {
    const days = this.form.expiring_soon_payment_reminder_schedule?.split(',') ?? [];

    return days
      .map(dayAsString => parseInt(dayAsString))
      .filter((day, index, allDays) => !isNaN(day) && allDays.indexOf(day) === index)
      .sort((dayA, dayB) => dayB - dayA)
      .map(day => ({ value: String(day), label: this.t('day', { count: day }) }));
  };

  private __expiringSoonPaymentReminderScheduleSetValue = (newItems: Item[]) => {
    this.edit({
      expiring_soon_payment_reminder_schedule: newItems.map(({ value }) => value).join(),
    });
  };

  private __reminderEmailScheduleGetValue = () => {
    const days = this.form.reminder_email_schedule?.split(',') ?? [];

    return days
      .map(dayAsString => parseInt(dayAsString))
      .filter((day, index, allDays) => !isNaN(day) && allDays.indexOf(day) === index)
      .sort((dayA, dayB) => dayA - dayB)
      .map(day => ({ value: String(day), label: this.t('day', { count: day }) }));
  };

  private __reminderEmailScheduleSetValue = (newItems: Item[]) => {
    this.edit({ reminder_email_schedule: newItems.map(({ value }) => value).join() });
  };

  private __reattemptScheduleGetValue = () => {
    const days = this.form.reattempt_schedule?.split(',') ?? [];

    return days
      .map(dayAsString => parseInt(dayAsString))
      .filter((day, index, allDays) => !isNaN(day) && allDays.indexOf(day) === index)
      .sort((dayA, dayB) => dayA - dayB)
      .map(day => ({ value: String(day), label: this.t('day', { count: day }) }));
  };

  private __reattemptScheduleSetValue = (newItems: Item[]) => {
    this.edit({ reattempt_schedule: newItems.map(({ value }) => value).join() });
  };

  private __getReattemptBypassStringsValue = () => {
    const strings = this.form.reattempt_bypass_strings?.split(',') ?? [];

    return strings
      .map(text => text.trim())
      .filter((text, index, strings) => text && strings.indexOf(text) === index)
      .map(text => ({ value: text }));
  };

  private __setReattemptBypassStringsValue = (newValue: Item[]) => {
    this.edit({ reattempt_bypass_strings: newValue.map(({ value }) => value).join() });
  };

  private __reattemptBypassLogicOptions: Option[] = [
    { value: '', label: 'option_always_reattempt' },
    { value: 'skip_if_exists', label: 'option_skip_if_exists' },
    { value: 'reattempt_if_exists', label: 'option_reattempt_if_exists' },
  ];

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['header:copy-id', super.hiddenSelector.toString()];

    if (!this.form.reattempt_bypass_logic) {
      alwaysMatch.push('reattempts-group:reattempt-bypass-strings');
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="past-due-amount-group">
        <foxy-internal-select-control
          layout="summary-item"
          infer="past-due-amount-handling"
          .options=${this.__pastDueAmountHandlingOptions}
        >
        </foxy-internal-select-control>

        <foxy-internal-switch-control
          infer="automatically-charge-past-due-amount"
          helper-text-as-tooltip
        >
        </foxy-internal-switch-control>

        <foxy-internal-switch-control
          infer="reset-nextdate-on-makeup-payment"
          helper-text-as-tooltip
        >
        </foxy-internal-switch-control>

        <foxy-internal-switch-control
          infer="prevent-customer-cancel-with-past-due"
          helper-text-as-tooltip
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="reattempts-group">
        <foxy-internal-select-control
          layout="summary-item"
          infer="reattempt-bypass-logic"
          .options=${this.__reattemptBypassLogicOptions}
        >
        </foxy-internal-select-control>

        <foxy-internal-editable-list-control
          layout="summary-item"
          infer="reattempt-bypass-strings"
          .getValue=${this.__getReattemptBypassStringsValue}
          .setValue=${this.__setReattemptBypassStringsValue}
        >
        </foxy-internal-editable-list-control>

        <foxy-internal-editable-list-control
          layout="summary-item"
          infer="reattempt-schedule"
          .inputParams=${this.__positiveIntegerInputParams}
          .getValue=${this.__reattemptScheduleGetValue}
          .setValue=${this.__reattemptScheduleSetValue}
        >
        </foxy-internal-editable-list-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="emails-group">
        <foxy-internal-switch-control
          infer="send-email-receipts-for-automated-billing"
          helper-text-as-tooltip
        >
        </foxy-internal-switch-control>

        <foxy-internal-editable-list-control
          layout="summary-item"
          infer="reminder-email-schedule"
          .inputParams=${this.__positiveIntegerInputParams}
          .getValue=${this.__reminderEmailScheduleGetValue}
          .setValue=${this.__reminderEmailScheduleSetValue}
        >
        </foxy-internal-editable-list-control>

        <foxy-internal-editable-list-control
          layout="summary-item"
          infer="expiring-soon-payment-reminder-schedule"
          .inputParams=${this.__positiveIntegerInputParams}
          .getValue=${this.__expiringSoonPaymentReminderScheduleGetValue}
          .setValue=${this.__expiringSoonPaymentReminderScheduleSetValue}
        >
        </foxy-internal-editable-list-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="modification-group">
        <foxy-internal-text-control layout="summary-item" infer="modification-url">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="cancellation-group">
        <foxy-internal-number-control
          layout="summary-item"
          suffix=${this.__cancellationScheduleSuffix}
          infer="cancellation-schedule"
          step="1"
          min="1"
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }

  private get __cancellationScheduleSuffix() {
    const schedule = this.form.cancellation_schedule;
    return schedule ? this.t('day_suffix', { count: schedule }) : '';
  }
}
