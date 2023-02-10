import type { Data, Templates } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Option } from '../../internal/InternalCheckboxGroupControl/types';
import type { Item } from '../../internal/InternalEditableListControl/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'subscription-settings-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for managing `fx:subscription_settings` resources.
 *
 * @slot past-due-amount-handling:before
 * @slot past-due-amount-handling:after
 *
 * @slot automatically-charge-past-due-amount:before
 * @slot automatically-charge-past-due-amount:after
 *
 * @slot clear-past-due-amounts-on-success:before – only if `form.automatically_charge_past_due_amount` is `false`
 * @slot clear-past-due-amounts-on-success:after – only if `form.automatically_charge_past_due_amount` is `false`
 *
 * @slot reset-nextdate-on-makeup-payment:before – only if `form.automatically_charge_past_due_amount` is `false`
 * @slot reset-nextdate-on-makeup-payment:after – only if `form.automatically_charge_past_due_amount` is `false`
 *
 * @slot reattempt-bypass:before
 * @slot reattempt-bypass:after
 *
 * @slot reattempt-schedule:before
 * @slot reattempt-schedule:after
 *
 * @slot reminder-email-schedule:before
 * @slot reminder-email-schedule:after
 *
 * @slot expiring-soon-payment-reminder-schedule:before
 * @slot expiring-soon-payment-reminder-schedule:after
 *
 * @slot send-email-receipts-for-automated-billing:before
 * @slot send-email-receipts-for-automated-billing:after
 *
 * @slot cancellation-schedule:before
 * @slot cancellation-schedule:after
 *
 * @slot modification-url:before
 * @slot modification-url:after
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @slot delete:before
 * @slot delete:after
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

  templates: Templates = {};

  private __sendEmailReceiptsForAutomatedBillingOptions: Option[] = [
    { label: 'option_checked', value: 'checked' },
  ];

  private __automaticallyChargePastDueAmountOptions: Option[] = [
    { label: 'option_checked', value: 'checked' },
  ];

  private __clearPastDueAmountsOnSuccessOptions: Option[] = [
    { label: 'option_checked', value: 'checked' },
  ];

  private __resetNextDateOnMakeUpPaymentOptions: Option[] = [
    { label: 'option_checked', value: 'checked' },
  ];

  private __pastDueAmountHandlingOptions: Option[] = [
    { label: 'option_increment', value: 'increment' },
    { label: 'option_replace', value: 'replace' },
    { label: 'option_ignore', value: 'ignore' },
  ];

  private __positiveIntegerInputParams = {
    type: 'number',
    step: '1',
    min: '0',
  };

  private __sendEmailReceiptsForAutomatedBillingGetValue = () => {
    return this.form.send_email_receipts_for_automated_billing ? ['checked'] : [];
  };

  private __sendEmailReceiptsForAutomatedBillingSetValue = (newValue: string[]) => {
    this.edit({ send_email_receipts_for_automated_billing: newValue.includes('checked') });
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

  private __automaticallyChargePastDueAmountGetValue = () => {
    return this.form.automatically_charge_past_due_amount ? ['checked'] : [];
  };

  private __automaticallyChargePastDueAmountSetValue = (newValue: string[]) => {
    const isChecked = newValue.includes('checked');
    this.edit({
      automatically_charge_past_due_amount: isChecked,
      clear_past_due_amounts_on_success: isChecked ? false : void 0,
      reset_nextdate_on_makeup_payment: isChecked ? false : void 0,
    });
  };

  private __clearPastDueAmountsOnSuccessGetValue = () => {
    return this.form.clear_past_due_amounts_on_success ? ['checked'] : [];
  };

  private __clearPastDueAmountsOnSuccessSetValue = (newValue: string[]) => {
    this.edit({ clear_past_due_amounts_on_success: newValue.includes('checked') });
  };

  private __resetNextDateOnMakeUpPaymentGetValue = () => {
    return this.form.reset_nextdate_on_makeup_payment ? ['checked'] : [];
  };

  private __resetNextDateOnMakeUpPaymentSetValue = (newValue: string[]) => {
    this.edit({ reset_nextdate_on_makeup_payment: newValue.includes('checked') });
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

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-radio-group-control
        infer="past-due-amount-handling"
        theme="vertical list"
        .options=${this.__pastDueAmountHandlingOptions}
      >
      </foxy-internal-radio-group-control>

      <foxy-internal-checkbox-group-control
        infer="automatically-charge-past-due-amount"
        class="-mt-xs -mb-m"
        .getValue=${this.__automaticallyChargePastDueAmountGetValue}
        .setValue=${this.__automaticallyChargePastDueAmountSetValue}
        .options=${this.__automaticallyChargePastDueAmountOptions}
      >
      </foxy-internal-checkbox-group-control>

      ${this.form.automatically_charge_past_due_amount
        ? ''
        : html`
            <foxy-internal-checkbox-group-control
              infer="clear-past-due-amounts-on-success"
              class="-mt-xs -mb-m"
              .getValue=${this.__clearPastDueAmountsOnSuccessGetValue}
              .setValue=${this.__clearPastDueAmountsOnSuccessSetValue}
              .options=${this.__clearPastDueAmountsOnSuccessOptions}
            >
            </foxy-internal-checkbox-group-control>

            <foxy-internal-checkbox-group-control
              infer="reset-nextdate-on-makeup-payment"
              class="-mt-xs -mb-m"
              .getValue=${this.__resetNextDateOnMakeUpPaymentGetValue}
              .setValue=${this.__resetNextDateOnMakeUpPaymentSetValue}
              .options=${this.__resetNextDateOnMakeUpPaymentOptions}
            >
            </foxy-internal-checkbox-group-control>
          `}

      <foxy-internal-subscription-settings-form-reattempt-bypass infer="reattempt-bypass">
      </foxy-internal-subscription-settings-form-reattempt-bypass>

      <foxy-internal-editable-list-control
        infer="reattempt-schedule"
        .inputParams=${this.__positiveIntegerInputParams}
        .getValue=${this.__reattemptScheduleGetValue}
        .setValue=${this.__reattemptScheduleSetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-editable-list-control
        infer="reminder-email-schedule"
        .inputParams=${this.__positiveIntegerInputParams}
        .getValue=${this.__reminderEmailScheduleGetValue}
        .setValue=${this.__reminderEmailScheduleSetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-editable-list-control
        infer="expiring-soon-payment-reminder-schedule"
        .inputParams=${this.__positiveIntegerInputParams}
        .getValue=${this.__expiringSoonPaymentReminderScheduleGetValue}
        .setValue=${this.__expiringSoonPaymentReminderScheduleSetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-checkbox-group-control
        infer="send-email-receipts-for-automated-billing"
        class="-mt-xs -mb-m"
        .options=${this.__sendEmailReceiptsForAutomatedBillingOptions}
        .getValue=${this.__sendEmailReceiptsForAutomatedBillingGetValue}
        .setValue=${this.__sendEmailReceiptsForAutomatedBillingSetValue}
      >
      </foxy-internal-checkbox-group-control>

      <foxy-internal-integer-control
        suffix=${this.__cancellationScheduleSuffix}
        infer="cancellation-schedule"
        min="1"
      >
      </foxy-internal-integer-control>

      <foxy-internal-text-control infer="modification-url"></foxy-internal-text-control>

      ${super.renderBody()}
    `;
  }

  private get __cancellationScheduleSuffix() {
    const schedule = this.form.cancellation_schedule;
    return schedule ? this.t('day_suffix', { count: schedule }) : '';
  }
}
