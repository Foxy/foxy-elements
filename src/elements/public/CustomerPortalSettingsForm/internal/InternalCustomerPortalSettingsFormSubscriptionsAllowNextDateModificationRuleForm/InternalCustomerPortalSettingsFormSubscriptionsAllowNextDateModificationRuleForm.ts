import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../../../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const Base = TranslatableMixin(InternalForm);

export class InternalCustomerPortalSettingsFormSubscriptionsAllowNextDateModificationRuleForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ jsonataQuery: v }) => !!v || 'jsonata-query:v8n_required',
      ({ jsonataQuery: v }) => !v || v.length <= 200 || 'jsonata-query:v8n_too_long',
      ({ disallowedDates: v }) => !v || v.length <= 10 || 'disallowed-dates:v8n_too_long',
    ];
  }

  private readonly __minmaxRestrictionsGetValue = () => {
    const value: string[] = [];
    const form = this.form;

    if (form.min) value.push('min');
    if (form.max) value.push('max');

    return value;
  };

  private readonly __minmaxRestrictionsSetValue = (newValue: string[]) => {
    const form = this.form;
    this.edit({
      min: newValue.includes('min') ? form.min || '1m' : null,
      max: newValue.includes('max') ? form.max || '1y' : null,
    });
  };

  private readonly __minmaxRestrictionsOptions = [
    { label: 'option_min', value: 'min' },
    { label: 'option_max', value: 'max' },
  ];

  private readonly __dayAndDateRestrictionsGetValue = () => {
    const type = this.form.allowedDays?.type;
    return type === 'day' ? 'days' : type === 'month' ? 'dates' : 'none';
  };

  private readonly __dayAndDateRestrictionsSetValue = (newValue: string) => {
    if (newValue === 'dates') {
      this.edit({ allowedDays: { type: 'month', days: [] } });
    } else if (newValue === 'days') {
      this.edit({ allowedDays: { type: 'day', days: [] } });
    } else {
      this.edit({ allowedDays: null });
    }
  };

  private readonly __dayAndDateRestrictionsOptions = [
    { label: 'option_none', value: 'none' },
    { label: 'option_dates', value: 'dates' },
    { label: 'option_days', value: 'days' },
  ];

  private readonly __daysOfWeekGetValue = () => {
    return this.form.allowedDays?.days.map(v => String(v)) ?? [];
  };

  private readonly __daysOfWeekSetValue = (newValue: string[]) => {
    this.edit({ allowedDays: { type: 'day', days: newValue.map(Number) } });
  };

  private readonly __daysOfWeekOptions = [
    { label: 'option_1', value: '1' },
    { label: 'option_2', value: '2' },
    { label: 'option_3', value: '3' },
    { label: 'option_4', value: '4' },
    { label: 'option_5', value: '5' },
    { label: 'option_6', value: '6' },
    { label: 'option_7', value: '7' },
  ];

  private readonly __datesOfMonthInputParams = { type: 'number', min: '1', max: '31', step: '1' };

  private readonly __datesOfMonthGetValue = () => {
    return this.form.allowedDays?.days.map(v => ({ value: String(v) })) ?? [];
  };

  private readonly __datesOfMonthSetValue = (newValue: { value: string }[]) => {
    this.edit({
      allowedDays: {
        type: 'month',
        days: newValue
          .map(v => parseInt(v.value))
          .filter(v => Number.isInteger(v) && v >= 1 && v <= 31),
      },
    });
  };

  private readonly __disallowedDatesInputParams = { type: 'date' };

  private readonly __disallowedDatesGetValue = () => {
    return this.form.disallowedDates?.map(v => ({ value: v })) ?? [];
  };

  private readonly __disallowedDatesSetValue = (newValue: { value: string }[]) => {
    this.edit({ disallowedDates: newValue.map(v => v.value) });
  };

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['timestamps', super.hiddenSelector.toString()];
    const form = this.form;

    if (!form.min) alwaysMatch.unshift('min');
    if (!form.max) alwaysMatch.unshift('max');
    if (form.allowedDays?.type !== 'day') alwaysMatch.unshift('days-of-week');
    if (form.allowedDays?.type !== 'month') alwaysMatch.unshift('dates-of-month');

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-source-control infer="jsonata-query" property="jsonataQuery">
      </foxy-internal-source-control>

      <foxy-internal-checkbox-group-control
        infer="minmax-restrictions"
        .getValue=${this.__minmaxRestrictionsGetValue}
        .setValue=${this.__minmaxRestrictionsSetValue}
        .options=${this.__minmaxRestrictionsOptions}
      >
      </foxy-internal-checkbox-group-control>

      <foxy-internal-frequency-control infer="min"></foxy-internal-frequency-control>
      <foxy-internal-frequency-control infer="max"></foxy-internal-frequency-control>

      <foxy-internal-radio-group-control
        infer="day-and-date-restrictions"
        .getValue=${this.__dayAndDateRestrictionsGetValue}
        .setValue=${this.__dayAndDateRestrictionsSetValue}
        .options=${this.__dayAndDateRestrictionsOptions}
      >
      </foxy-internal-radio-group-control>

      <foxy-internal-checkbox-group-control
        infer="days-of-week"
        theme="vertical"
        .getValue=${this.__daysOfWeekGetValue}
        .setValue=${this.__daysOfWeekSetValue}
        .options=${this.__daysOfWeekOptions}
      >
      </foxy-internal-checkbox-group-control>

      <foxy-internal-editable-list-control
        infer="dates-of-month"
        .inputParams=${this.__datesOfMonthInputParams}
        .getValue=${this.__datesOfMonthGetValue}
        .setValue=${this.__datesOfMonthSetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-editable-list-control
        infer="disallowed-dates"
        range="optional"
        .inputParams=${this.__disallowedDatesInputParams}
        .getValue=${this.__disallowedDatesGetValue}
        .setValue=${this.__disallowedDatesSetValue}
      >
      </foxy-internal-editable-list-control>

      ${super.renderBody()}
    `;
  }
}
