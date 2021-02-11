import { CSSResult, CSSResultArray } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ConfirmDialogElement } from '../../private/ConfirmDialog/ConfirmDialogElement';
import { Data } from './types';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { FrequencyInput } from '../../private/FrequencyInput/FrequencyInput';
import { FrequencyInputChangeEvent } from '../../private/FrequencyInput/FrequencyInputChangeEvent';
import { I18NElement } from '../I18N/index';
import { NucleonElement } from '../NucleonElement/index';
import { NucleonV8N } from '../NucleonElement/types';
import { PropertyTableElement } from '../../private/index';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { memoize } from 'lodash-es';
import { parseDuration } from '../../../utils/parse-duration';

export class SubscriptionFormElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-date-picker': customElements.get('vaadin-date-picker'),
      'x-frequency-input': FrequencyInput,
      'x-property-table': PropertyTableElement,
      'x-confirm-dialog': ConfirmDialogElement,
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ next_transaction_date: v }) => {
        return (v && new Date(v).getTime() > Date.now()) || 'next_transaction_date_past';
      },
      ({ frequency: v }) => {
        return (v && /^(([0-9]{1,3}[dwmy]{1})|(\.5m))$/.test(v)) || 'frequency_invalid';
      },
    ];
  }

  private static __ns = 'subscription-form';

  private __untrackTranslations?: () => void;

  private __getValidator = memoize((prefix: string) => () => {
    return !this.state.context.errors.some(err => err.startsWith(prefix));
  });

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = I18NElement.onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const { lang, state } = this;
    const form = { ...state.context.edits, ...state.context.data };

    const ns = SubscriptionFormElement.__ns;
    const frequency = parseDuration(form.frequency ?? '1m');
    const transaction = state.context.data?._embedded['fx:last_transaction'];
    const frequencyOpts = {
      count: frequency.count,
      units: this.__t(frequency.units, { count: frequency.count }),
      amount: this.__formatPrice(
        transaction?.total_order ?? 0,
        transaction?.currency_code ?? 'USD'
      ),
    };

    let statusDate: Date | null = null;
    let statusKey = '';

    if (form.first_failed_transaction_date) {
      statusDate = new Date(form.first_failed_transaction_date);
      statusKey = 'status_failed';
    } else if (form.end_date) {
      statusDate = new Date(form.end_date);
      const hasEnded = statusDate.getTime() > Date.now();
      statusKey = hasEnded ? 'status_will_be_cancelled' : 'status_cancelled';
    } else {
      statusDate = new Date(form.next_transaction_date ?? Date.now());
      statusKey = 'status_active';
    }

    const statusOpts = { date: this.__formatDate(statusDate) };
    const isSnapshot = state.matches({ idle: 'snapshot' });
    const isIdle = state.matches('idle');

    return html`
      <x-confirm-dialog
        message="end_message"
        confirm="end_yes"
        cancel="end_no"
        header="end"
        theme="primary error"
        lang=${lang}
        ns=${ns}
        id="confirm"
        @submit=${this.__end}
      >
      </x-confirm-dialog>

      <div
        class=${classMap({
          'relative space-y-l text-body font-lumo text-m leading-m': true,
          'text-disabled': !isSnapshot,
          'text-body': isSnapshot,
        })}
      >
        <div class="leading-s">
          <foxy-i18n
            class="text-xl font-medium"
            lang=${lang}
            key="frequency"
            ns=${ns}
            .opts=${frequencyOpts}
          >
          </foxy-i18n>

          <br />

          <foxy-i18n
            class=${classMap({ 'text-secondary': isSnapshot })}
            lang=${lang}
            key=${statusKey}
            ns=${ns}
            .opts=${statusOpts}
          >
          </foxy-i18n>
        </div>

        <div class="space-y-m">
          <div class="space-y-xs">
            <foxy-i18n
              class=${classMap({
                'font-medium antialiased block text-s': true,
                'text-disabled': !isSnapshot,
                'text-secondary': isSnapshot,
              })}
              lang=${lang}
              key="th_frequency"
              ns=${ns}
            >
            </foxy-i18n>

            <x-frequency-input
              ns=${ns}
              lang=${lang}
              value=${form.frequency ?? '1m'}
              label=${this.__t('th_frequency').toString()}
              ?invalid=${this.__getValidator('frequency')()}
              ?disabled=${!isIdle}
              ?readonly=${isIdle && !form.is_active}
              error-message=${this.__getErrorMessage('frequency')}
              @change=${this.__handleFrequencyChange}
            >
            </x-frequency-input>
          </div>

          <vaadin-date-picker
            class="w-full"
            label=${this.__t('next_transaction_date').toString()}
            value=${this.__toYyyyMmDd(new Date(form.next_transaction_date ?? Date.now()))}
            error-message=${this.__getErrorMessage('next_transaction_date')}
            ?disabled=${!isIdle}
            ?readonly=${isIdle && !form.next_transaction_date}
            .checkValidity=${isIdle ? this.__getValidator('next_transaction_date') : () => true}
            @change=${this.__handleNextTransactionDateChange}
          >
          </vaadin-date-picker>
        </div>

        <x-property-table ?disabled=${!isIdle} .items=${this.__getPropertyTableItems()}>
        </x-property-table>

        ${form.is_active
          ? html`
              <vaadin-button
                theme="error primary"
                class="w-full"
                ?disabled=${!isIdle}
                @click=${this.__confirmEnd}
              >
                <foxy-i18n ns=${ns} lang=${lang} key="end"></foxy-i18n>
              </vaadin-button>
            `
          : ''}
        ${!isIdle
          ? html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  state=${state.matches('busy') ? 'busy' : 'error'}
                  layout="vertical"
                >
                </foxy-spinner>
              </div>
            `
          : ''}
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
    this.__getValidator.cache.clear?.();
  }

  private get __t() {
    return I18NElement.i18next.getFixedT(this.lang, SubscriptionFormElement.__ns);
  }

  private __getErrorMessage(prefix: string) {
    const error = this.state.context.errors.find(err => err.startsWith(prefix));
    return error ? this.__t(error).toString() : '';
  }

  private __getPropertyTableItems() {
    const data = this.state.context.data;
    return (['date_modified', 'date_created'] as const).map(field => ({
      name: this.__t(field),
      value: this.__formatDate(new Date(data?.[field] ?? Date.now())),
    }));
  }

  private __toYyyyMmDd(date: Date) {
    return [
      date.getFullYear().toString().padStart(4, '0'),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDay().toString().padStart(2, '0'),
    ].join('-');
  }

  private __formatDate(date: Date, lang = this.lang): string {
    try {
      return date.toLocaleDateString(lang, {
        day: 'numeric',
        month: 'long',
        year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
      });
    } catch {
      return this.__formatDate(date, I18NElement.fallbackLng);
    }
  }

  private __formatPrice(value: number, currency: string, lang = this.lang): string {
    try {
      return value.toLocaleString(lang, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        style: 'currency',
        currency,
      });
    } catch {
      return this.__formatPrice(value, currency, I18NElement.fallbackLng);
    }
  }

  private __confirmEnd(evt: Event) {
    const confirm = this.renderRoot.querySelector('#confirm') as ConfirmDialogElement;
    confirm.show(evt.currentTarget as HTMLElement);
  }

  private __end() {
    const today = new Date();
    const tomorrow = new Date(today.setDate(today.getDate() + 1));

    this.send({ type: 'EDIT', data: { end_date: tomorrow.toISOString() } });
    this.send({ type: 'SUBMIT' });
  }

  private __handleFrequencyChange(evt: FrequencyInputChangeEvent) {
    this.send({ type: 'EDIT', data: { frequency: evt.detail! } });
  }

  private __handleNextTransactionDateChange(evt: CustomEvent<unknown>) {
    const target = evt.target as DatePickerElement;
    this.send({ type: 'EDIT', data: { next_transaction_date: target.value } });
  }
}
