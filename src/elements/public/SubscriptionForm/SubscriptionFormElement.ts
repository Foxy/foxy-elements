import { CSSResult, CSSResultArray } from 'lit-element';
import { Choice, Group, PropertyTableElement, Skeleton } from '../../private/index';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ChoiceChangeEvent } from '../../private/events';
import { Data } from './types';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { I18nElement } from '../I18n/index';
import { NucleonElement } from '../NucleonElement/index';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { memoize } from 'lodash-es';
import { parseDuration } from '../../../utils/parse-duration';

export class SubscriptionFormElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-date-picker': customElements.get('vaadin-date-picker'),
      'x-property-table': PropertyTableElement,
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-skeleton': Skeleton,
      'x-choice': Choice,
      'x-group': Group,
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  private static __predefinedFrequencies = ['.5m', '1m', '1y'];

  private static __ns = 'subscription-form';

  private __untrackTranslations?: () => void;

  private __memoRenderHeader = memoize(this.__renderHeader.bind(this), (...args) => args.join());

  private __memoRenderStatus = memoize(this.__renderStatus.bind(this), (...args) => args.join());

  private __memoRenderTable = memoize(this.__renderTable.bind(this), (...args) => args.join());

  private __muteBuiltInV8N = () => true;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = I18nElement.onTranslationChange(() => {
      this.__memoRenderTable.cache.clear?.();
      this.requestUpdate();
    });
  }

  render(): TemplateResult {
    const ns = SubscriptionFormElement.__ns;
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));

    return html`
      <div
        class="text-body relative space-y-l text-body font-lumo text-m leading-m"
        aria-busy=${this.in('busy')}
        aria-live="polite"
      >
        <div class="leading-s">
          <div class="text-xl font-medium tracking-wide">
            ${this.data
              ? this.__memoRenderHeader(
                  this.lang,
                  this.data.frequency,
                  this.data._embedded['fx:last_transaction'].total_order,
                  this.data._embedded['fx:last_transaction'].currency_code
                )
              : html`<x-skeleton class="w-full" variant="static"></x-skeleton>`}
          </div>

          <div class="text-secondary">
            ${this.data
              ? this.__memoRenderStatus(
                  this.lang,
                  this.data.next_transaction_date,
                  this.data.first_failed_transaction_date,
                  this.data.end_date
                )
              : html`<x-skeleton class="w-full" variant="static"></x-skeleton>`}
          </div>
        </div>

        <x-group frame>
          <foxy-i18n
            class=${classMap({ 'text-disabled': !this.in('idle') })}
            slot="header"
            lang=${this.lang}
            key="th_frequency"
            ns=${ns}
          >
          </foxy-i18n>

          <x-choice
            default-custom-value="1d"
            type="frequency"
            custom
            .items=${SubscriptionFormElement.__predefinedFrequencies}
            .value=${this.form.frequency ?? null}
            ?disabled=${!this.in({ idle: 'snapshot' })}
            @change=${this.__handleFrequencyChange}
          >
            <foxy-i18n slot=".5m-label" lang=${this.lang} key="frequency_0_5m" ns=${ns}></foxy-i18n>
            <foxy-i18n slot="1m-label" lang=${this.lang} key="monthly" ns=${ns}></foxy-i18n>
            <foxy-i18n slot="1y-label" lang=${this.lang} key="yearly" ns=${ns}></foxy-i18n>
          </x-choice>
        </x-group>

        <vaadin-date-picker
          min=${tomorrow.toISOString().substr(0, 10)}
          class="w-full"
          label=${this.__t('next_transaction_date').toString()}
          value=${this.form.next_transaction_date?.substr(0, 10) ?? ''}
          ?disabled=${!this.in({ idle: 'snapshot' })}
          ?readonly=${this.in({ idle: 'snapshot' }) && !this.data.is_active}
          .checkValidity=${this.__muteBuiltInV8N}
          @change=${this.__handleNextTransactionDateChange}
        >
        </vaadin-date-picker>

        <vaadin-date-picker
          min=${tomorrow.toISOString().substr(0, 10)}
          class="w-full"
          label=${this.__t('end_date').toString()}
          value=${this.form.end_date?.substr(0, 10) ?? ''}
          placeholder=${this.__t('end_date_placeholder').toString()}
          ?disabled=${!this.in({ idle: 'snapshot' })}
          ?readonly=${this.in({ idle: 'snapshot' }) && !this.data.is_active}
          .checkValidity=${this.__muteBuiltInV8N}
          @change=${this.__handleEndDateChange}
        >
        </vaadin-date-picker>

        ${this.__memoRenderTable(
          !this.in({ idle: 'snapshot' }),
          this.data?.date_created ?? '',
          this.data?.date_modified ?? ''
        )}

        <div
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex items-center justify-center': true,
            'pointer-events-none opacity-0': this.in({ idle: 'snapshot' }),
            'opacity-100': !this.in({ idle: 'snapshot' }),
          })}
        >
          <foxy-spinner
            class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in({ idle: 'template' }) ? 'empty' : this.in('fail') ? 'error' : 'busy'}
            layout="vertical"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
    this.__memoRenderHeader.cache.clear?.();
    this.__memoRenderStatus.cache.clear?.();
    this.__memoRenderTable.cache.clear?.();
  }

  private get __t() {
    return I18nElement.i18next.getFixedT(this.lang, SubscriptionFormElement.__ns);
  }

  private __handleFrequencyChange(evt: ChoiceChangeEvent) {
    this.edit({ frequency: evt.detail as string });
  }

  private __handleEndDateChange(evt: CustomEvent<unknown>) {
    const target = evt.target as DatePickerElement;
    this.edit({ end_date: target.value });
  }

  private __handleNextTransactionDateChange(evt: CustomEvent<unknown>) {
    const target = evt.target as DatePickerElement;
    this.edit({ next_transaction_date: target.value });
  }

  private __renderHeader(lang: string, frequency: string, total: number, currency: string) {
    return html`
      <foxy-i18n
        lang=${lang}
        key="sub_pricing${frequency === '.5m' ? '_0_5m' : ''}"
        ns=${SubscriptionFormElement.__ns}
        .opts=${{ ...parseDuration(frequency), amount: `${total} ${currency}` }}
      >
      </foxy-i18n>
    `;
  }

  private __renderStatus(
    lang: string,
    nextTransactionDate: string | null | undefined,
    firstFailedTransactionDate: string | null | undefined,
    endDate: string | null | undefined
  ) {
    const ns = SubscriptionFormElement.__ns;

    let date: string;
    let key: string;

    if (firstFailedTransactionDate) {
      date = firstFailedTransactionDate;
      key = 'status_failed';
    } else if (endDate) {
      date = endDate;
      const hasEnded = new Date(date).getTime() > Date.now();
      key = hasEnded ? 'status_will_be_cancelled' : 'status_cancelled';
    } else {
      date = nextTransactionDate ?? new Date().toISOString();
      key = 'status_active';
    }

    return html`<foxy-i18n lang=${lang} key=${key} ns=${ns} .opts=${{ date }}></foxy-i18n>`;
  }

  private __renderTable(disabled: boolean, dateCreated: string, dateModified: string) {
    const dateCreatedRow = {
      name: this.__t('date_modified'),
      value: this.__t('date', { value: dateModified }),
    };

    const dateModifiedRow = {
      name: this.__t('date_created'),
      value: this.__t('date', { value: dateCreated }),
    };

    return html`
      <x-property-table ?disabled=${disabled} .items=${[dateCreatedRow, dateModifiedRow]}>
      </x-property-table>
    `;
  }
}
