import {
  getAllowedFrequencies,
  getNextTransactionDateConstraints,
  isNextTransactionDate,
} from '@foxy.io/sdk/customer';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { ButtonElement } from '@vaadin/vaadin-button';
import { CSSResult, CSSResultArray, PropertyDeclarations } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import memoize from 'lodash-es/memoize';
import { Themeable } from '../../../mixins/themeable';
import { booleanSelectorOf } from '../../../utils/boolean-selector-of';
import { classMap } from '../../../utils/class-map';
import { parseFrequency } from '../../../utils/parse-frequency';
import { serializeDate } from '../../../utils/serialize-date';
import { Calendar } from '../../internal/Calendar';
import { Choice, Group, Skeleton } from '../../private/index';
import { PageRendererContext } from '../CollectionPages/types';
import { FormDialog } from '../FormDialog';
import { Preview } from '../ItemsForm/private/Preview';
import { NucleonElement } from '../NucleonElement/index';
import { CellContext } from '../Table/types';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import { Data as TransactionsTableData } from '../TransactionsTable/types';
import { Data, Settings } from './types';

export class SubscriptionForm extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-collection-pages': customElements.get('foxy-collection-pages'),
      'vaadin-combo-box': customElements.get('vaadin-combo-box'),
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
      'foxy-internal-calendar': customElements.get('foxy-internal-calendar'),
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'vcf-tooltip': customElements.get('vcf-tooltip'),
      'foxy-table': customElements.get('foxy-table'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'iron-icon': customElements.get('iron-icon'),
      'x-skeleton': Skeleton,
      'x-preview': Preview,
      'x-choice': Choice,
      'x-group': Group,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      settings: { type: Object },
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  settings: Settings | null = null;

  private static __predefinedFrequencies = ['.5m', '1m', '1y'];

  private static __ns = 'subscription-form';

  private __untrackTranslations?: () => void;

  private __memoRenderHeader = memoize(this.__renderHeader.bind(this), (...args) => args.join());

  private __memoRenderStatus = memoize(this.__renderStatus.bind(this), (...args) => args.join());

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = customElements
      .get('foxy-i18n')
      .onTranslationChange(() => this.requestUpdate());
  }

  render(): TemplateResult {
    const ns = SubscriptionForm.__ns;
    const active = !!this.data?.is_active;
    const isIdleSnapshot = this.in({ idle: 'snapshot' });
    const items = this.data?._embedded['fx:transaction_template']._embedded['fx:items'] ?? [];
    const formItems = items.map(({ _links, _embedded, ...item }) => item);

    return html`
      <foxy-form-dialog
        readonly=${booleanSelectorOf(this.readonly, 'cancellation-dialog')}
        disabled=${booleanSelectorOf(this.disabled, 'cancellation-dialog')}
        excluded="save-button ${this.excluded.zoom('cancellation-dialog').toString()}"
        parent=${this.parent}
        header="end_subscription"
        alert
        form="foxy-subscription-cancellation-form"
        href=${this.href}
        lang=${this.lang}
        id="cancellation-dialog"
        ns=${ns}
      >
      </foxy-form-dialog>

      <div
        data-testid="wrapper"
        aria-busy=${this.in('busy')}
        aria-live="polite"
        class="text-body relative space-y-l text-body font-lumo text-m leading-m"
      >
        <div class="leading-xs">
          <div class="text-xxl font-bold">
            ${this.data
              ? this.__memoRenderHeader(
                  this.lang,
                  this.data.frequency,
                  this.data._embedded['fx:last_transaction'].total_order,
                  this.data._embedded['fx:last_transaction'].currency_code
                )
              : html`<x-skeleton class="w-full" variant="static">&nbsp;</x-skeleton>`}
          </div>
          <div class="text-l">
            ${this.data
              ? this.__memoRenderStatus(
                  this.lang,
                  this.data.next_transaction_date,
                  this.data.first_failed_transaction_date,
                  this.data.error_message,
                  this.data.end_date
                )
              : html`<x-skeleton class="w-full" variant="static">&nbsp;</x-skeleton>`}
          </div>
        </div>

        <slot name="after-status"></slot>

        ${!this.excluded.matches('items') && this.data
          ? html`
              <x-group frame>
                <slot name="items-header" slot="header">
                  <foxy-i18n key="item_plural" ns=${ns} lang=${this.lang}> </foxy-i18n>
                </slot>

                <div class="divide-y divide-contrast-10 pl-s">
                  ${formItems.map(
                    item => html`
                      <figure class="flex items-center space-x-m py-s pr-m">
                        <x-preview class="w-l h-l" .quantity=${item.quantity} .image=${item.image}>
                        </x-preview>

                        <figcaption class="leading-s flex-1 flex justify-between items-center">
                          <div class="flex flex-col">
                            <span class="font-medium">${item.name}</span>
                            <span class="text-secondary text-s">
                              ${item.price.toLocaleString(this.lang || 'en', {
                                style: 'currency',
                                currency: this.data!._embedded['fx:last_transaction'].currency_code,
                              })}
                            </span>
                          </div>

                          ${item.quantity > 1
                            ? html`
                                <div class="px-s h-xs rounded bg-contrast-5 flex items-center">
                                  <span class="font-tnum text-contrast text-s font-bold">
                                    ${item.quantity}
                                  </span>
                                </div>
                              `
                            : ''}
                        </figcaption>
                      </figure>
                    `
                  )}
                </div>
              </x-group>
            `
          : ''}

        <slot name="after-items"></slot>

        ${!this.excluded.matches('end-button') && !this.data?.end_date
          ? html`
              <vaadin-button
                theme="error"
                class="w-full"
                ?disabled=${!isIdleSnapshot || this.disabled.matches('end-button')}
                @click=${(evt: Event) =>
                  this.__cancellationDialog.show(evt.currentTarget as ButtonElement)}
              >
                <foxy-i18n key="end_subscription" ns=${ns} lang=${this.lang}></foxy-i18n>
              </vaadin-button>
            `
          : ''}

        <slot name="after-end-button"></slot>

        ${this.__isNextTransactionDateVisible
          ? html`
              <x-group frame>
                <foxy-i18n key="next_transaction_date" ns=${ns} lang=${this.lang} slot="header">
                </foxy-i18n>

                <foxy-internal-calendar
                  data-testid="nextPaymentDate"
                  value=${ifDefined(this.data?.next_transaction_date)}
                  ?readonly=${!active || this.readonly.matches('next-transaction-date')}
                  ?disabled=${!isIdleSnapshot || this.disabled.matches('next-transaction-date')}
                  start=${ifDefined(this.data?.next_transaction_date.substr(0, 10))}
                  .checkAvailability=${(date: Date) => {
                    const isFutureDate = date.getTime() >= Date.now();

                    if (this.settings && this.data) {
                      return isNextTransactionDate({
                        value: serializeDate(date),
                        settings: this.settings,
                        subscription: this.data,
                      });
                    }

                    return isFutureDate;
                  }}
                  @change=${this.__handleNextTransactionDateChange}
                >
                </foxy-internal-calendar>
              </x-group>
            `
          : ''}

        <slot name="after-next-payment-date"></slot>

        ${this.__isFrequencyVisible
          ? this.settings && this.__frequencies.length > 4
            ? html`
                <vaadin-combo-box
                  item-value-path="value"
                  item-label-path="label"
                  ?disabled=${!isIdleSnapshot || this.disabled.matches('frequency')}
                  ?readonly=${isIdleSnapshot && (!active || this.readonly.matches('frequency'))}
                  .items=${this.__frequencies.map(v => ({
                    label: this.__t(v === '.5m' ? 'twice_a_month' : 'frequency', parseFrequency(v)),
                    value: v,
                  }))}
                  class="w-full"
                  label=${this.__t('frequency_label').toString()}
                  value=${ifDefined(this.form.frequency)}
                  @change=${this.__handleFrequencyChange}
                >
                </vaadin-combo-box>
              `
            : html`
                <x-group frame>
                  <foxy-i18n key="frequency_label" ns=${ns} lang=${this.lang} slot="header">
                  </foxy-i18n>

                  <x-choice
                    default-custom-value="1d"
                    data-testid="frequency"
                    type="frequency"
                    ?custom=${this.settings === null}
                    .items=${this.__frequencies}
                    .value=${this.form.frequency ?? null}
                    ?disabled=${!isIdleSnapshot || this.disabled.matches('frequency')}
                    ?readonly=${isIdleSnapshot && (!active || this.readonly.matches('frequency'))}
                    @change=${this.__handleFrequencyChange}
                  >
                    ${this.__frequencies.map(
                      frequency => html`
                        <foxy-i18n
                          data-testclass="i18n"
                          slot="${frequency}-label"
                          lang=${this.lang}
                          key=${frequency === '.5m' ? 'twice_a_month' : 'frequency'}
                          ns=${ns}
                          options=${JSON.stringify(parseFrequency(frequency))}
                        >
                        </foxy-i18n>
                      `
                    )}
                  </x-choice>
                </x-group>
              `
          : ''}

        <slot name="after-frequency"></slot>

        ${!this.excluded.matches('transactions') && this.data
          ? html`
              <x-group frame>
                <foxy-i18n lang=${this.lang} slot="header" key="transaction_plural" ns=${ns}>
                </foxy-i18n>

                <foxy-collection-pages
                  group=${this.group}
                  class="block divide-y divide-contrast-10 px-m"
                  first=${this.data?._links['fx:transactions'].href ?? ''}
                  lang=${this.lang}
                  .page=${(ctx: PageRendererContext) => {
                    return ctx.html`
                      <foxy-table
                        group=${ctx.group}
                        lang=${ctx.lang}
                        href=${ctx.href}
                        .columns=${[
                          {
                            cell(ctx: CellContext<TransactionsTableData>) {
                              const colors: Record<string, string> = {
                                declined: 'text-error',
                                rejected: 'text-error',
                              };

                              const status = TransactionsTable.statusColumn.cell!(ctx);
                              const price = TransactionsTable.priceColumn.cell!(ctx);
                              const color = colors[ctx.data.status] ?? 'text-body';

                              return ctx.html`
                                <span class="sr-only">${status}</span>
                                <span class="${color} text-s">${price}</span>
                              `;
                            },
                          },
                          { cell: TransactionsTable.idColumn.cell, hideBelow: 'sm' },
                          { cell: TransactionsTable.dateColumn.cell },
                          { cell: TransactionsTable.receiptColumn.cell },
                        ]}
                      >
                      </foxy-table>
                    `;
                  }}
                >
                </foxy-collection-pages>
              </x-group>
            `
          : ''}

        <slot name="after-transactions"></slot>

        <div
          data-testid="spinnerWrapper"
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex items-center justify-center': true,
            'pointer-events-none opacity-0': this.in({ idle: 'snapshot' }),
            'opacity-100': !this.in({ idle: 'snapshot' }),
          })}
        >
          <foxy-spinner
            data-testid="spinner"
            layout="vertical"
            class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in({ idle: 'template' }) ? 'empty' : this.in('fail') ? 'error' : 'busy'}
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
  }

  private get __t() {
    return customElements.get('foxy-i18n').i18next.getFixedT(this.lang, SubscriptionForm.__ns);
  }

  private get __isNextTransactionDateVisible() {
    if (this.excluded.matches('next-transaction-date')) return false;
    if (this.settings === null) return true;
    if (this.data === null) return false;

    const rules = this.settings.subscriptions.allow_next_date_modification;
    return !!getNextTransactionDateConstraints(this.data, rules);
  }

  private get __isFrequencyVisible() {
    if (this.excluded.matches('frequency')) return false;
    if (this.settings === null) return true;
    if (this.data === null) return false;

    const allowedFrequencies = getAllowedFrequencies({
      subscription: this.data,
      settings: this.settings,
    });

    return !allowedFrequencies.next().done;
  }

  private get __frequencies() {
    if (!this.settings || !this.data) return SubscriptionForm.__predefinedFrequencies;

    const allowedFrequencies = getAllowedFrequencies({
      subscription: this.data,
      settings: this.settings,
    });

    return Array.from(allowedFrequencies);
  }

  private get __cancellationDialog(): FormDialog {
    return this.renderRoot.querySelector('#cancellation-dialog') as FormDialog;
  }

  private __handleFrequencyChange(evt: Event) {
    this.edit({ frequency: (evt.target as HTMLInputElement).value });
  }

  private __handleNextTransactionDateChange(evt: CustomEvent<unknown>) {
    const target = evt.target as Calendar;
    this.edit({ next_transaction_date: target.value });
  }

  private __renderHeader(lang: string, frequency: string, total: number, currency: string) {
    return html`
      <foxy-i18n
        data-testclass="i18n"
        data-testid="header"
        lang=${lang}
        key="price_${frequency === '.5m' ? 'twice_a_month' : 'recurring'}"
        ns=${SubscriptionForm.__ns}
        .options=${{ ...parseFrequency(frequency), amount: `${total} ${currency}` }}
      >
      </foxy-i18n>
    `;
  }

  private __renderStatus(
    lang: string,
    nextTransactionDate: string | null | undefined,
    firstFailedTransactionDate: string | null | undefined,
    errorMessage: string | undefined,
    endDate: string | null | undefined
  ) {
    const ns = SubscriptionForm.__ns;

    let color = 'text-secondary';
    let date: string;
    let key: string;

    if (firstFailedTransactionDate) {
      color = 'text-error';
      date = firstFailedTransactionDate;
      key = 'subscription_failed';
    } else if (endDate) {
      date = endDate;
      const hasEnded = new Date(date).getTime() > Date.now();
      key = hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
    } else {
      date = nextTransactionDate ?? new Date().toISOString();
      key = 'subscription_active';
    }

    const text = html`
      <foxy-i18n
        data-testclass="i18n"
        data-testid="status"
        class=${color}
        lang=${lang}
        key=${key}
        ns=${ns}
        .options=${{ date }}
      >
      </foxy-i18n>
    `;

    if (!firstFailedTransactionDate) return text;

    return html`
      <span id="status" class="flex items-center space-x-xs ${color}">
        ${text}<iron-icon icon="icons:info-outline" class="icon-inline"></iron-icon>
      </span>
      <vcf-tooltip for="status" position="bottom">
        <span class="text-s">${errorMessage}</span>
      </vcf-tooltip>
    `;
  }
}
