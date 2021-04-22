import { CSSResult, CSSResultArray } from 'lit-element';
import { Choice, Group, PropertyTable, Skeleton } from '../../private/index';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { CellContext } from '../Table/types';
import { ChoiceChangeEvent } from '../../private/events';
import { Data } from './types';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { NucleonElement } from '../NucleonElement/index';
import { PageRendererContext } from '../CollectionPages/types';
import { Themeable } from '../../../mixins/themeable';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import { Data as TransactionsTableData } from '../TransactionsTable/types';
import { classMap } from '../../../utils/class-map';
import memoize from 'lodash-es/memoize';
import { parseFrequency } from '../../../utils/parse-frequency';

export class SubscriptionForm extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-collection-pages': customElements.get('foxy-collection-pages'),
      'vaadin-date-picker': customElements.get('vaadin-date-picker'),
      'x-property-table': PropertyTable,
      'foxy-items-form': customElements.get('foxy-items-form'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-table': customElements.get('foxy-table'),
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
    this.__untrackTranslations = customElements.get('foxy-i18n').onTranslationChange(() => {
      this.__memoRenderTable.cache.clear?.();
      this.requestUpdate();
    });
  }

  render(): TemplateResult {
    const ns = SubscriptionForm.__ns;
    const active = !!this.data?.is_active;
    const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
    const isIdleSnapshot = this.in({ idle: 'snapshot' });
    const items = this.data?._embedded['fx:transaction_template']._embedded['fx:items'] ?? [];
    const formItems = items.map(({ _links, _embedded, ...item }) => item);

    return html`
      <div
        data-testid="wrapper"
        aria-busy=${this.in('busy')}
        aria-live="polite"
        class="text-body relative space-y-l text-body font-lumo text-m leading-m"
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
              : html`<x-skeleton class="w-full" variant="static">&nbsp;</x-skeleton>`}
          </div>

          <div class="text-secondary">
            ${this.data
              ? this.__memoRenderStatus(
                  this.lang,
                  this.data.next_transaction_date,
                  this.data.first_failed_transaction_date,
                  this.data.end_date
                )
              : html`<x-skeleton class="w-full" variant="static">&nbsp;</x-skeleton>`}
          </div>
        </div>

        ${!this.excluded.matches('frequency')
          ? html`
              <x-group frame>
                <x-choice
                  default-custom-value="1d"
                  data-testid="frequency"
                  type="frequency"
                  custom
                  .items=${SubscriptionForm.__predefinedFrequencies}
                  .value=${this.form.frequency ?? null}
                  ?disabled=${!isIdleSnapshot || this.disabled.matches('frequency')}
                  ?readonly=${isIdleSnapshot && (!active || this.readonly.matches('frequency'))}
                  @change=${this.__handleFrequencyChange}
                >
                  <foxy-i18n
                    data-testclass="i18n"
                    slot=".5m-label"
                    lang=${this.lang}
                    key="twice_a_month"
                    ns=${ns}
                  >
                  </foxy-i18n>

                  <foxy-i18n
                    data-testclass="i18n"
                    slot="1m-label"
                    lang=${this.lang}
                    key="monthly"
                    ns=${ns}
                  >
                  </foxy-i18n>

                  <foxy-i18n
                    data-testclass="i18n"
                    slot="1y-label"
                    lang=${this.lang}
                    key="yearly"
                    ns=${ns}
                  >
                  </foxy-i18n>
                </x-choice>
              </x-group>
            `
          : ''}
        <!---->
        ${!this.excluded.matches('next-transaction-date')
          ? html`
              <vaadin-date-picker
                data-testid="nextPaymentDate"
                class="w-full"
                label=${this.__t('next_transaction_date').toString()}
                value=${this.form.next_transaction_date?.substr(0, 10) ?? ''}
                min=${tomorrow.toISOString().substr(0, 10)}
                ?disabled=${!isIdleSnapshot || this.disabled.matches('next-transaction-date')}
                ?readonly=${isIdleSnapshot &&
                (!active || this.readonly.matches('next-transaction-date'))}
                .checkValidity=${this.__muteBuiltInV8N}
                @change=${this.__handleNextTransactionDateChange}
              >
              </vaadin-date-picker>
            `
          : ''}
        <!---->
        ${!this.excluded.matches('end-date')
          ? html`
              <vaadin-date-picker
                data-testid="endDate"
                class="w-full"
                label=${this.__t('end_date').toString()}
                value=${this.form.end_date?.substr(0, 10) ?? ''}
                min=${tomorrow.toISOString().substr(0, 10)}
                ?disabled=${!isIdleSnapshot || this.disabled.matches('end-date')}
                ?readonly=${isIdleSnapshot && (!active || this.readonly.matches('end-date'))}
                .checkValidity=${this.__muteBuiltInV8N}
                @change=${this.__handleEndDateChange}
              >
              </vaadin-date-picker>
            `
          : ''}
        <!---->
        ${!this.excluded.matches('timestamps')
          ? this.__memoRenderTable(
              !this.in({ idle: 'snapshot' }),
              this.data?.date_created ?? '',
              this.data?.date_modified ?? ''
            )
          : ''}
        <!---->
        ${!this.excluded.matches('items') && this.in({ idle: 'snapshot' })
          ? html`
              <div class="pt-m border-t-4 border-contrast-5">
                <foxy-i18n
                  class="text-l font-medium tracking-wide"
                  key="item_plural"
                  ns=${ns}
                  lang=${this.lang}
                >
                </foxy-i18n>

                <div class="-mx-l -mb-l -mt-s">
                  <foxy-items-form
                    store="unapplicable"
                    currency=${this.data?._embedded['fx:last_transaction'].currency_code ?? 'usd'}
                    lang=${this.lang}
                    items=${JSON.stringify(formItems)}
                    readonly
                  >
                  </foxy-items-form>
                  <div class="clear-both"></div>
                </div>
              </div>
            `
          : ''}
        <!---->
        ${!this.excluded.matches('transactions') && this.in({ idle: 'snapshot' })
          ? html`
              <div class="space-y-m pt-m border-t-4 border-contrast-5">
                <foxy-i18n
                  class="text-l font-medium tracking-wide"
                  key="transaction_plural"
                  ns=${ns}
                  lang=${this.lang}
                >
                </foxy-i18n>

                <foxy-collection-pages
                  group=${this.group}
                  class="divide-y divide-contrast-10"
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
                          { cell: TransactionsTable.idColumn.cell },
                          { cell: TransactionsTable.dateColumn.cell },
                          { cell: TransactionsTable.receiptColumn.cell },
                        ]}
                      >
                      </foxy-table>
                    `;
                  }}
                >
                </foxy-collection-pages>
              </div>
            `
          : ''}

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
    this.__memoRenderTable.cache.clear?.();
  }

  private get __t() {
    return customElements.get('foxy-i18n').i18next.getFixedT(this.lang, SubscriptionForm.__ns);
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
    endDate: string | null | undefined
  ) {
    const ns = SubscriptionForm.__ns;

    let date: string;
    let key: string;

    if (firstFailedTransactionDate) {
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

    return html`
      <foxy-i18n
        data-testclass="i18n"
        data-testid="status"
        lang=${lang}
        key=${key}
        ns=${ns}
        .options=${{ date }}
      >
      </foxy-i18n>
    `;
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
