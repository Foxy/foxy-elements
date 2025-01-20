import type { TemplateResult, PropertyDeclarations } from 'lit-element';
import type { DatePickerElement } from '@vaadin/vaadin-date-picker';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { serializeDate } from '../../../utils/serialize-date';
import { parseDate } from '../../../utils/parse-date';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

import { getWeekdayShortNames } from './getWeekdayShortNames';
import { getWeekdayLongNames } from './getWeekdayLongNames';
import { getMonthNames } from './getMonthNames';

/**
 * Internal control displaying a basic date picker box.
 *
 * @since 1.17.0
 * @element foxy-internal-date-control
 */
export class InternalDateControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      format: {},
      layout: {},
    };
  }

  /** Date format. If `unix`, expects and outputs a UNIX timestamp (number), otherwise defaults to ISO 8601 date. */
  format: 'unix' | 'iso-long' | null = null;

  /** Use summary item layout inside `<foxy-internal-summary-control>`. */
  layout: 'summary-item' | 'standalone' | null = null;

  renderControl(): TemplateResult {
    let value: string;

    if (this._value === '0000-00-00' || !this._value) {
      value = '';
    } else {
      if (this.format === 'unix') {
        value = serializeDate(new Date(((this._value as number) ?? 0) * 1000));
      } else if (this.format === 'iso-long') {
        value = serializeDate(new Date(this._value as string));
      } else {
        value = this._value as string;
      }
    }

    return html`
      <vaadin-date-picker
        error-message=${ifDefined(this._errorMessage)}
        placeholder=${this.placeholder}
        helper-text=${this.helperText}
        label=${this.label}
        class="w-full"
        theme=${this.layout ?? 'standalone'}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${value}
        .i18n=${this.__pickerI18n}
        clear-button-visible
        @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.nucleon?.submit()}
        @change=${(evt: CustomEvent) => {
          const field = evt.currentTarget as DatePickerElement;

          if (this.format === 'unix') {
            this._value = Math.floor((parseDate(field.value)?.getTime() ?? 0) / 1000);
          } else if (this.format === 'iso-long') {
            const parsedDate = parseDate(field.value);
            this._value = parsedDate ? this.__toApiDate(parsedDate) : null;
          } else {
            this._value = field.value;
          }
        }}
      >
      </vaadin-date-picker>
    `;
  }

  private get __pickerI18n() {
    return {
      monthNames: getMonthNames(this.lang || 'en'),
      weekdays: getWeekdayLongNames(this.lang || 'en'),
      weekdaysShort: getWeekdayShortNames(this.lang || 'en'),
      firstDayOfWeek: 0,
      week: this.t('week'),
      calendar: this.t('calendar'),
      clear: this.t('clear'),
      today: this.t('today'),
      cancel: this.t('cancel'),
      referenceDate: '',
      parseDate: null,
      formatTitle: (m: string, y: string) => m + ' ' + y,
      formatDate: (d: { day: number; month: number; year: number }) => {
        return this.t('display_value', { value: new Date(d.year, d.month, d.day) });
      },
    };
  }

  private __toApiDate(date: Date): string {
    return date
      .toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        timeZoneName: 'longOffset',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(
        /(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+) GMT([+-])(\d+):(\d+)/,
        '$3-$1-$2T$4:$5:$6$7$8$9'
      );
  }
}
