import * as FoxySDK from '@foxy.io/sdk';

import { HypermediaResource, I18N, PropertyTable } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { ConfirmDialog } from '../../private/Dialog/ConfirmDialog';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { ElementResourceV8N } from '../../private/HypermediaResource/types';
import { FrequencyInput } from '../../private/FrequencyInput/FrequencyInput';
import { FrequencyInputChangeEvent } from '../../private/FrequencyInput/FrequencyInputChangeEvent';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { parseDuration } from '../../../utils/parse-duration';

type Subscription = FoxySDK.Core.Resource<
  FoxySDK.Integration.Rels.Subscription,
  { zoom: 'last_transaction' }
>;

const isFrequency = (v: string) => /^(([0-9]{1,3}[dwmy]{1})|(\.5m))$/.test(v);
const isFuture = (v: Date) => v.getTime() > Date.now();

export class SubscriptionFormElement extends HypermediaResource<Subscription> {
  static readonly defaultNodeName = 'foxy-subscription-form';

  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-date-picker': DatePickerElement,
      'x-frequency-input': FrequencyInput,
      'x-property-table': PropertyTable,
      'x-confirm-dialog': ConfirmDialog,
      'vaadin-button': ButtonElement,
      'x-i18n': I18N,
    };
  }

  static get resourceV8N(): ElementResourceV8N<Subscription> {
    return {
      next_transaction_date: [
        ({ next_transaction_date: v }) => typeof v === 'string' || 'errors.required',
        ({ next_transaction_date: v }) => (v && isFuture(new Date(v))) || 'errors.past',
      ],
      frequency: [
        ({ frequency: v }) => typeof v === 'string' || 'errors.required',
        ({ frequency: v }) => (v && isFrequency(v)) || 'errors.invalid',
      ],
    };
  }

  readonly rel = 'subscription';

  constructor() {
    super('subscription-form');
  }

  submit(): void {
    this._submit();
  }

  render(): TemplateResult {
    if (!this.resource) return html``;

    const { ns, lang } = this;
    const frequency = parseDuration(this.resource.frequency);
    const transaction = this.resource._embedded['fx:last_transaction'];
    const frequencyOpts = {
      count: frequency.count,
      units: this._t(frequency.units, { count: frequency.count }),
      amount: transaction.total_order.toLocaleString(this.lang, {
        maximumFractionDigits: 2,
        minimumFractionDigits: 2,
        currency: transaction.currency_code,
        style: 'currency',
      }),
    };

    let statusDate: Date | null = null;
    let statusKey = '';

    if (this.resource.first_failed_transaction_date) {
      statusDate = new Date(this.resource.first_failed_transaction_date);
      statusKey = 'status_failed';
    } else if (this.resource.end_date) {
      statusDate = new Date(this.resource.end_date);
      const hasEnded = statusDate.getTime() > Date.now();
      statusKey = hasEnded ? 'status_will_be_cancelled' : 'status_cancelled';
    } else {
      statusDate = new Date(this.resource.next_transaction_date);
      statusKey = 'status_active';
    }

    const statusOpts = { date: this.__formatDate(statusDate) };

    return html`
      <x-confirm-dialog
        message="end_message"
        confirm="end_yes"
        cancel="end_no"
        header="end"
        theme="primary error"
        lang=${this.lang}
        ns=${this.ns}
        id="confirm"
        @submit=${this.__end}
      >
      </x-confirm-dialog>

      <div class="space-y-l text-body font-lumo text-m leading-m">
        <div class="leading-s">
          <x-i18n
            ns=${ns}
            lang=${lang}
            key="frequency"
            class="text-xl font-medium block"
            .opts=${frequencyOpts}
          >
          </x-i18n>

          <x-i18n ns=${ns} lang=${lang} .opts=${statusOpts} key=${statusKey} class="text-secondary">
          </x-i18n>
        </div>

        <div class="space-y-m">
          <div class="space-y-xs">
            <x-i18n
              ns=${ns}
              lang=${lang}
              key="th_frequency"
              class="font-medium antialiased block text-s text-secondary"
            >
            </x-i18n>

            <x-frequency-input
              ns=${ns}
              lang=${lang}
              value=${this.resource.frequency}
              label=${this._t('th_frequency').toString()}
              ?invalid=${!!this._getErrorMessages().frequency}
              ?readonly=${!this.resource.is_active}
              ?disabled=${!this._is('idle')}
              error-message=${this._getErrorMessages().frequency ?? ''}
              @change=${(evt: FrequencyInputChangeEvent) => {
                this._setProperty({ frequency: evt.detail! });
              }}
            >
            </x-frequency-input>
          </div>

          <vaadin-date-picker
            class="w-full"
            label=${this._t('next_transaction_date').toString()}
            value=${this.__toYyyyMmDd(new Date(this.resource.next_transaction_date))}
            ?invalid=${!!this._getErrorMessages().next_transaction_date}
            ?readonly=${!this.resource.next_transaction_date}
            ?disabled=${!this._is('idle')}
            error-message=${this._getErrorMessages().next_transaction_date ?? ''}
            @change=${(evt: CustomEvent<unknown>) => {
              const target = evt.target as DatePickerElement;
              this._setProperty({ next_transaction_date: target.value });
            }}
          >
          </vaadin-date-picker>
        </div>

        <x-property-table .items=${this.__getPropertyTableItems(this.resource)}></x-property-table>

        ${this.resource.is_active
          ? html`
              <vaadin-button
                theme="error primary"
                class="w-full"
                ?disabled=${!this._is('idle')}
                @click=${this.__confirmEnd}
              >
                <x-i18n ns=${ns} lang=${lang} key="end"></x-i18n>
              </vaadin-button>
            `
          : ''}
      </div>
    `;
  }

  private __getPropertyTableItems(resource: Subscription) {
    return (['date_modified', 'date_created'] as const).map(field => ({
      name: this._t(field),
      value: this.__formatDate(new Date(resource[field])),
    }));
  }

  private __toYyyyMmDd(date: Date) {
    return [
      date.getFullYear().toString().padStart(4, '0'),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDay().toString().padStart(2, '0'),
    ].join('-');
  }

  private __formatDate(date: Date) {
    return date.toLocaleDateString(this.lang, {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    });
  }

  private __confirmEnd() {
    const confirm = this.renderRoot.querySelector('#confirm') as ConfirmDialog;
    confirm.show();
  }

  private __end() {
    const today = new Date();
    const tomorrow = new Date(today.setDate(today.getDate() + 1));

    this._setProperty({ end_date: tomorrow.toISOString() });
    this._submit();
  }
}
