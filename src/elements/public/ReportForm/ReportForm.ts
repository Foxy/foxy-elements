import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Data } from './types';

import {
  getCurrentMonth,
  getCurrentQuarter,
  getCurrentYear,
  getLast30Days,
  getLast365Days,
  getPreviousMonth,
  getPreviousQuarter,
  getPreviousYear,
  toAPIDateTime,
  toDatePickerValue,
  toNativeDateTimePickerValue,
} from './utils';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { NucleonV8N } from '../NucleonElement/types';
import { html } from 'lit-element';

const Base = TranslatableMixin(InternalForm, 'report-form');

/**
 * Form element for creating or editing reports (`fx:report`).
 *
 * @element foxy-report-form
 * @since 1.16.0
 */
export class ReportForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __showRangeTime: { attribute: false },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ datetime_start: v }) => !!v || 'datetime-start:v8n_required',
      ({ datetime_end: v }) => !!v || 'datetime-end:v8n_required',
      ({ name: v }) => !!v || 'name:v8n_required',
    ];
  }

  private __showRangeTime = false;

  private readonly __rawPresetOptions = [
    { value: '0', label: 'option_previous_quarter', ...getPreviousQuarter() },
    { value: '1', label: 'option_previous_month', ...getPreviousMonth() },
    { value: '2', label: 'option_previous_year', ...getPreviousYear() },
    { value: '3', label: 'option_this_quarter', ...getCurrentQuarter() },
    { value: '4', label: 'option_this_month', ...getCurrentMonth() },
    { value: '5', label: 'option_this_year', ...getCurrentYear() },
    { value: '6', label: 'option_last_365_days', ...getLast365Days() },
    { value: '7', label: 'option_last_30_days', ...getLast30Days() },
  ];

  private readonly __presetOptions = JSON.stringify([
    ...this.__rawPresetOptions,
    { value: 'custom', label: 'option_custom' },
  ]);

  private readonly __nameOptions = JSON.stringify([
    { value: 'complete', label: 'option_complete' },
    { value: 'customers', label: 'option_customers' },
    { value: 'customers_ltv', label: 'option_customers_ltv' },
  ]);

  private readonly __datetimePreciseGetValue = () => {
    return this.__showRangeTime;
  };

  private readonly __datetimePreciseSetValue = (value: boolean) => {
    this.__showRangeTime = value;
  };

  private readonly __datetimeStartGetValue = () => {
    const value = this.form.datetime_start;
    return value
      ? this.__showRangeTime || this.data
        ? toNativeDateTimePickerValue(value)
        : toDatePickerValue(value)
      : '';
  };

  private readonly __datetimeStartSetValue = (value: string) => {
    const time = this.__showRangeTime ? `${value.split('T')[1] ?? '00:00'}:00` : '00:00:00';
    this.edit({ datetime_start: `${value.split('T')[0]}T${time}` });
  };

  private readonly __datetimeEndGetValue = () => {
    const value = this.form.datetime_end;
    return value
      ? this.__showRangeTime || this.data
        ? toNativeDateTimePickerValue(value)
        : toDatePickerValue(value)
      : '';
  };

  private readonly __datetimeEndSetValue = (value: string) => {
    const time = this.__showRangeTime ? `${value.split('T')[1] ?? '23:59'}:59` : '23:59:59';
    this.edit({ datetime_end: `${value.split('T')[0]}T${time}` });
  };

  private readonly __presetGetValue = () => {
    return (
      this.__rawPresetOptions.find(option => {
        const { datetime_end: end, datetime_start: start } = this.form;
        return (
          start && end && toAPIDateTime(option.start) === start && toAPIDateTime(option.end) === end
        );
      })?.value ?? 'custom'
    );
  };

  private readonly __presetSetValue = (value: string) => {
    const option = this.__rawPresetOptions.find(option => option.value === value);

    if (option) {
      this.edit({
        datetime_start: toAPIDateTime(option.start),
        datetime_end: toAPIDateTime(option.end),
      });
    }
  };

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    if (this.data) {
      alwaysMatch.unshift('name', 'preset', 'datetime-precise', 'datetime-start', 'datetime-end');
    }
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];
    if (this.data) alwaysMatch.unshift('preset', 'datetime-precise');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="" label="" helper-text="">
        <foxy-internal-select-control
          helper-text=${this.t(`name.helper_text_${this.form.name ?? 'none'}`)}
          options=${this.__nameOptions}
          layout="summary-item"
          infer="name"
        >
        </foxy-internal-select-control>

        <foxy-internal-select-control
          options=${this.__presetOptions}
          layout="summary-item"
          infer="preset"
          .getValue=${this.__presetGetValue}
          .setValue=${this.__presetSetValue}
        >
        </foxy-internal-select-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="" label="" helper-text="">
        <foxy-internal-native-date-control
          format=${this.__showRangeTime || this.data ? 'datetime-local' : 'date'}
          infer="datetime-start"
          .getValue=${this.__datetimeStartGetValue}
          .setValue=${this.__datetimeStartSetValue}
        >
        </foxy-internal-native-date-control>

        <foxy-internal-native-date-control
          format=${this.__showRangeTime || this.data ? 'datetime-local' : 'date'}
          infer="datetime-end"
          .getValue=${this.__datetimeEndGetValue}
          .setValue=${this.__datetimeEndSetValue}
        >
        </foxy-internal-native-date-control>

        <foxy-internal-switch-control
          infer="datetime-precise"
          .getValue=${this.__datetimePreciseGetValue}
          .setValue=${this.__datetimePreciseSetValue}
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }
}
