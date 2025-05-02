import type { SVGTemplateResult, TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../../../NucleonElement/types';
import type { Data } from './types';

import { BooleanSelector } from '@foxy.io/sdk/core';
import { serializeDate } from '../../../../../utils/serialize-date';
import { InternalForm } from '../../../../internal/InternalForm/InternalForm';
import { parseDate } from '../../../../../utils/parse-date';
import { html, svg } from 'lit-html';

export class InternalAdminSubscriptionFormStatusActionForm extends InternalForm<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ next_transaction_date, end_date, is_active }) => {
        if (is_active) {
          if (!end_date || end_date === '0000-00-00') return 'end-date:v8n_required';
        } else {
          if (!next_transaction_date) return 'next-transaction-date:v8n_required';
        }

        return true;
      },
    ];
  }

  private readonly __endDatePresetOptions = JSON.stringify([
    { value: 'tomorrow', label: 'option_tomorrow' },
    { value: 'next_transaction_date', label: 'option_next_transaction_date' },
    { value: 'custom_date', label: 'option_custom_date' },
  ]);

  private readonly __endDatePresetGetValue = () =>
    this.form.end_date_preset ?? 'next_transaction_date';

  private readonly __endDatePresetSetValue = (newValue: string) => {
    this.edit({ end_date_preset: newValue });

    if (newValue === 'tomorrow') {
      const tomorrowDate = new Date();
      tomorrowDate.setDate(tomorrowDate.getDate() + 1);
      tomorrowDate.setHours(0, 0, 0, 0);
      this.edit({ end_date: serializeDate(tomorrowDate) });
    } else if (newValue === 'next_transaction_date') {
      this.edit({ end_date: this.form.next_transaction_date });
    } else {
      this.edit({ end_date: '' });
    }
  };

  private readonly __endDateGetValue = () => {
    return this.form.end_date_preset ? this.form.end_date : this.form.next_transaction_date;
  };

  private readonly __nextTransactionDateGetValue = () => {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDate.setHours(0, 0, 0, 0);

    const tomorrow = serializeDate(tomorrowDate);
    if (!this.form.next_transaction_date) return tomorrow;

    const currentNextDate = parseDate(this.form.next_transaction_date.substring(0, 10));
    if (!currentNextDate || currentNextDate < tomorrowDate) return tomorrow;

    return this.form.next_transaction_date;
  };

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    if (this.form.end_date_preset !== 'custom_date') alwaysMatch.push('end-date');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    tomorrowDate.setHours(0, 0, 0, 0);

    const isActive = !!this.data?.is_active;
    const action = isActive ? 'cancel' : 'reactivate';
    const color = isActive ? 'bg-error-10' : 'bg-success-10';
    const icon = isActive
      ? svg`<svg class="text-error" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 2rem; height: 2rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" /></svg>`
      : svg`<svg class="text-success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 2rem; height: 2rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>`;

    return html`
      <foxy-internal-summary-control infer="" label="" helper-text="">
        <div class="text-center flex flex-col items-center bg-transparent">
          <div class="rounded-full ${color} p-m mb-s mx-auto">${icon}</div>
          <p class="font-medium text-xl leading-m">
            <foxy-i18n infer="" key="${action}_title"></foxy-i18n>
          </p>
          <p class="text-secondary leading-s">
            <foxy-i18n infer="" key="${action}_subtitle"></foxy-i18n>
          </p>
        </div>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="" label="" helper-text="">
        ${isActive
          ? html`
              <foxy-internal-select-control
                options=${this.__endDatePresetOptions}
                layout="summary-item"
                infer="end-date-preset"
                .getValue=${this.__endDatePresetGetValue}
                .setValue=${this.__endDatePresetSetValue}
              >
              </foxy-internal-select-control>

              <foxy-internal-date-control
                layout="summary-item"
                infer="end-date"
                min=${serializeDate(tomorrowDate)}
                hide-clear-button
                .getValue=${this.__endDateGetValue}
              >
              </foxy-internal-date-control>
            `
          : html`
              <foxy-internal-date-control
                layout="summary-item"
                infer="next-transaction-date"
                min=${serializeDate(tomorrowDate)}
                hide-clear-button
                .getValue=${this.__nextTransactionDateGetValue}
              >
              </foxy-internal-date-control>
            `}
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="" label="" helper-text="">
        ${isActive
          ? [
              this.__renderFaq(
                'cancel_why_not_today',
                svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-error flex-shrink-0" style="width: 1.25em; height: 1.25em;"><path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" /><path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" /></svg>`
              ),
              this.__renderFaq(
                'cancel_whats_next',
                svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-error flex-shrink-0" style="width: 1.25em; height: 1.25em;"><path d="M3.288 4.818A1.5 1.5 0 0 0 1 6.095v7.81a1.5 1.5 0 0 0 2.288 1.276l6.323-3.905c.155-.096.285-.213.389-.344v2.973a1.5 1.5 0 0 0 2.288 1.276l6.323-3.905a1.5 1.5 0 0 0 0-2.552l-6.323-3.906A1.5 1.5 0 0 0 10 6.095v2.972a1.506 1.506 0 0 0-.389-.343L3.288 4.818Z" /></svg>`
              ),
              this.__renderFaq(
                'cancel_how_to_reactivate',
                svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-error flex-shrink-0" style="width: 1.25em; height: 1.25em;"><path d="M6.111 11.89A5.5 5.5 0 1 1 15.501 8 .75.75 0 0 0 17 8a7 7 0 1 0-11.95 4.95.75.75 0 0 0 1.06-1.06Z" /><path d="M8.232 6.232a2.5 2.5 0 0 0 0 3.536.75.75 0 1 1-1.06 1.06A4 4 0 1 1 14 8a.75.75 0 0 1-1.5 0 2.5 2.5 0 0 0-4.268-1.768Z" /><path d="M10.766 7.51a.75.75 0 0 0-1.37.365l-.492 6.861a.75.75 0 0 0 1.204.65l1.043-.799.985 3.678a.75.75 0 0 0 1.45-.388l-.978-3.646 1.292.204a.75.75 0 0 0 .74-1.16l-3.874-5.764Z" /></svg>`
              ),
            ]
          : [
              this.__renderFaq(
                'reactivate_why_not_today',
                svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-success flex-shrink-0" style="width: 1.25em; height: 1.25em;"><path d="M5.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H6a.75.75 0 0 1-.75-.75V12ZM6 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H6ZM7.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H8a.75.75 0 0 1-.75-.75V12ZM8 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H8ZM9.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V10ZM10 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H10ZM9.25 14a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H10a.75.75 0 0 1-.75-.75V14ZM12 9.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V10a.75.75 0 0 0-.75-.75H12ZM11.25 12a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H12a.75.75 0 0 1-.75-.75V12ZM12 13.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V14a.75.75 0 0 0-.75-.75H12ZM13.25 10a.75.75 0 0 1 .75-.75h.01a.75.75 0 0 1 .75.75v.01a.75.75 0 0 1-.75.75H14a.75.75 0 0 1-.75-.75V10ZM14 11.25a.75.75 0 0 0-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 0 0 .75-.75V12a.75.75 0 0 0-.75-.75H14Z" /><path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" /></svg>`
              ),
              this.__renderFaq(
                'reactivate_whats_next',
                svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="text-success flex-shrink-0" style="width: 1.25em; height: 1.25em;"><path d="M3.288 4.818A1.5 1.5 0 0 0 1 6.095v7.81a1.5 1.5 0 0 0 2.288 1.276l6.323-3.905c.155-.096.285-.213.389-.344v2.973a1.5 1.5 0 0 0 2.288 1.276l6.323-3.905a1.5 1.5 0 0 0 0-2.552l-6.323-3.906A1.5 1.5 0 0 0 10 6.095v2.972a1.506 1.506 0 0 0-.389-.343L3.288 4.818Z" /></svg>`
              ),
            ]}
      </foxy-internal-summary-control>

      <vaadin-button
        theme="primary ${isActive ? 'error' : 'success'} large"
        class="w-full"
        ?disabled=${this.disabled}
        @click=${() => this.submit()}
      >
        <foxy-i18n infer="" key="${action}_submit"></foxy-i18n>
      </vaadin-button>
    `;
  }

  submit(): void {
    if (this.data?.is_active) {
      if (this.__endDatePresetGetValue() === 'next_transaction_date') {
        this.edit({ end_date: this.form.next_transaction_date });
      }
    } else {
      this.edit({
        next_transaction_date: this.__nextTransactionDateGetValue(),
        is_active: true,
        end_date: '0000-00-00',
      });
    }

    super.submit();
  }

  protected async _sendPatch(edits: Partial<Data>): Promise<Data> {
    delete edits.end_date_preset;
    return super._sendPatch(edits);
  }

  private __renderFaq(prefix: string, icon: SVGTemplateResult) {
    return html`
      <div
        class="bg-transparent flex leading-xs"
        style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
      >
        ${icon}
        <p class="grid">
          <foxy-i18n class="leading-m text-s font-medium" infer="" key="${prefix}_title">
          </foxy-i18n>
          <foxy-i18n class="leading-xs text-secondary text-xs" infer="" key="${prefix}_text">
          </foxy-i18n>
        </p>
      </div>
    `;
  }
}
