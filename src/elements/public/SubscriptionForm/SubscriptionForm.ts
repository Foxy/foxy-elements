import { Choice, Group, Skeleton } from '../../private/index';
import { Data, Item, Settings, Templates } from './types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';
import {
  getAllowedFrequencies,
  getNextTransactionDateConstraints,
  isNextTransactionDate,
} from '@foxy.io/sdk/customer';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CellContext } from '../Table/types';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { FormDialog } from '../FormDialog';
import { InternalCalendar } from '../../internal/InternalCalendar';
import { NucleonElement } from '../NucleonElement/index';
import { PageRendererContext } from '../CollectionPages/types';
import { Preview } from '../ItemsForm/private/Preview';
import { PropertyDeclarations } from 'lit-element';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TransactionsTable } from '../TransactionsTable/TransactionsTable';
import { Data as TransactionsTableData } from '../TransactionsTable/types';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { parseFrequency } from '../../../utils/parse-frequency';
import { serializeDate } from '../../../utils/serialize-date';

const NS = 'subscription-form';
const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)))
);

/**
 * Form element for creating or editing subscriptions.
 *
 * @slot header:before - **new in v1.4.0**
 * @slot header:after - **new in v1.4.0**
 *
 * @slot items:before - **new in v1.4.0**
 * @slot items:after - **new in v1.4.0**
 * @slot items:actions:before - **new in v1.4.0**
 * @slot items:actions:after - **new in v1.4.0**
 *
 * @slot end-date:before - **new in v1.4.0**
 * @slot end-date:after - **new in v1.4.0**
 *
 * @slot next-transaction-date:before - **new in v1.4.0**
 * @slot next-transaction-date:after - **new in v1.4.0**
 *
 * @slot frequency:before - **new in v1.4.0**
 * @slot frequency:after - **new in v1.4.0**
 *
 * @slot transactions:before - **new in v1.4.0**
 * @slot transactions:after - **new in v1.4.0**
 *
 * @element foxy-subscription-form
 * @since 1.2.0
 */
export class SubscriptionForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-calendar': customElements.get('foxy-internal-calendar'),
      'foxy-collection-pages': customElements.get('foxy-collection-pages'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'vaadin-combo-box': customElements.get('vaadin-combo-box'),
      'foxy-form-dialog': customElements.get('foxy-form-dialog'),
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

  settings: Settings | null = null;

  templates: Templates = {};

  private readonly __renderHeaderSubtitle = () => {
    const { data, lang, ns } = this;

    if (data) {
      let color = 'text-secondary';
      let date: string;
      let key: string;

      if (data.first_failed_transaction_date) {
        color = 'text-error';
        date = data.first_failed_transaction_date;
        key = 'subscription_failed';
      } else if (data.end_date) {
        date = data.end_date;
        const hasEnded = new Date(date).getTime() > Date.now();
        key = hasEnded ? 'subscription_will_be_cancelled' : 'subscription_cancelled';
      } else {
        date = data.next_transaction_date ?? new Date().toISOString();
        key = 'subscription_active';
      }

      const text = html`
        <foxy-i18n
          data-testid="header-subtitle"
          options=${JSON.stringify({ date })}
          class=${color}
          lang=${lang}
          key=${key}
          ns=${ns}
        >
        </foxy-i18n>
      `;

      if (data.first_failed_transaction_date) {
        return html`
          <span id="status" class="flex items-center space-x-xs ${color}">
            ${text}<iron-icon icon="icons:info-outline" class="icon-inline"></iron-icon>
          </span>
          <vcf-tooltip for="status" position="bottom">
            <span class="text-s">${data.error_message}</span>
          </vcf-tooltip>
        `;
      }

      return text;
    }

    return html`<x-skeleton class="w-full" variant="static">&nbsp;</x-skeleton>`;
  };

  private readonly __renderHeaderTitle = () => {
    const { data, lang, ns } = this;

    if (data) {
      const frequency = parseFrequency(data.frequency);
      const currency = data._embedded['fx:last_transaction'].currency_code;
      const total = data._embedded['fx:last_transaction'].total_order;

      return html`
        <foxy-i18n
          data-testid="header-title"
          options=${JSON.stringify({ ...frequency, amount: `${total} ${currency}` })}
          lang=${lang}
          key="price_${data.frequency === '.5m' ? 'twice_a_month' : 'recurring'}"
          ns=${ns}
        >
        </foxy-i18n>
      `;
    }

    return html`<x-skeleton class="w-full" variant="static">&nbsp;</x-skeleton>`;
  };

  private readonly __renderHeader = () => {
    return html`
      <div data-testid="header">
        ${this.renderTemplateOrSlot('header:before')}
        <div class="leading-xs text-xxl font-bold">${this.__renderHeaderTitle()}</div>
        <div class="leading-xs text-l">${this.__renderHeaderSubtitle()}</div>
        ${this.renderTemplateOrSlot('header:after')}
      </div>
    `;
  };

  private readonly __renderItemsActions = () => {
    return html`
      <div class="flex" data-testid="items:actions">
        ${this.renderTemplateOrSlot('items:actions:before')}

        <foxy-i18n
          data-testid="items:actions-label"
          class="flex-1"
          lang=${this.lang}
          key="item_plural"
          ns=${this.ns}
        >
        </foxy-i18n>

        ${this.renderTemplateOrSlot('items:actions:after')}
      </div>
    `;
  };

  private readonly __renderItemsItem = (item: Item) => {
    const price = item.price.toLocaleString(this.lang || 'en', {
      style: 'currency',
      currency: this.data!._embedded['fx:last_transaction'].currency_code,
    });

    let quantity: TemplateResult;

    if (item.quantity > 1) {
      quantity = html`
        <div
          data-testclass="item-quantity"
          class="px-s h-xs rounded bg-contrast-5 flex items-center font-tnum text-contrast text-s font-bold"
        >
          ${item.quantity}
        </div>
      `;
    } else {
      quantity = html``;
    }

    return html`
      <figure class="flex items-center space-x-m py-s pr-m" data-testclass="item">
        <x-preview
          data-testclass="item-preview"
          class="w-l h-l"
          .quantity=${item.quantity}
          .image=${item.image}
        >
        </x-preview>

        <figcaption class="leading-s flex-1 flex justify-between items-center">
          <div class="flex flex-col">
            <span class="font-medium" data-testclass="item-name">${item.name}</span>
            <span class="text-secondary text-s" data-testclass="item-price">${price}</span>
          </div>

          ${quantity}
        </figcaption>
      </figure>
    `;
  };

  private readonly __renderItems = () => {
    const hiddenSelector = this.hiddenSelector;
    const items = this.data?._embedded['fx:transaction_template']._embedded['fx:items'] ?? [];
    const label = hiddenSelector.matches('items:actions', true) ? '' : this.__renderItemsActions();

    return html`
      <div data-testid="items">
        ${this.renderTemplateOrSlot('items:before')}
        <x-group frame>
          <div slot="header">${label}</div>
          <div class="divide-y divide-contrast-10 pl-s">${items.map(this.__renderItemsItem)}</div>
        </x-group>
        ${this.renderTemplateOrSlot('items:after')}
      </div>
    `;
  };

  private readonly __renderEndDate = () => {
    const { disabledSelector, lang, ns } = this;
    const formHiddenSelector = this.hiddenSelector.zoom('end-date:form').toString();

    return html`
      <div>
        ${this.renderTemplateOrSlot('end-date:before')}

        <foxy-form-dialog
          readonlycontrols=${this.readonlySelector.zoom('end-date:form').toString()}
          disabledcontrols=${disabledSelector.zoom('end-date:form').toString()}
          hiddencontrols="save-button ${formHiddenSelector}"
          data-testid="cancellation-form"
          parent=${this.parent}
          header="end_subscription"
          alert
          form="foxy-cancellation-form"
          href=${this.href}
          lang=${lang}
          id="end-date-form"
          ns=${ns}
          .templates=${this.getNestedTemplates('end-date:form')}
        >
        </foxy-form-dialog>

        <vaadin-button
          data-testid="end-date"
          theme="error"
          class="w-full"
          ?disabled=${!this.data || disabledSelector.matches('end-date', true)}
          @click=${(evt: Event) => {
            const form = this.renderRoot.querySelector('#end-date-form') as FormDialog;
            form.show(evt.currentTarget as ButtonElement);
          }}
        >
          <foxy-i18n key="end_subscription" ns=${ns} lang=${lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('end-date:after')}
      </div>
    `;
  };

  private readonly __checkNextTransactionDateAvailability = (date: Date) => {
    const { settings, data: subscription } = this;

    if (settings && subscription) {
      const value = serializeDate(date);
      return isNextTransactionDate({ value, settings, subscription });
    }

    return date.getTime() >= Date.now();
  };

  private readonly __renderNextTransactionDate = () => {
    const { data, lang, ns } = this;
    const isActive = !!data?.is_active;

    return html`
      <div data-testid="next-transaction-date">
        ${this.renderTemplateOrSlot('next-transaction-date:before')}

        <x-group frame>
          <foxy-i18n key="next_transaction_date" ns=${ns} lang=${lang} slot="header"></foxy-i18n>
          <foxy-internal-calendar
            start=${ifDefined(data?.next_transaction_date.substr(0, 10))}
            value=${ifDefined(data?.next_transaction_date)}
            lang=${lang}
            ?readonly=${!isActive || this.readonlySelector.matches('next-transaction-date', true)}
            ?disabled=${!data || this.disabledSelector.matches('next-transaction-date', true)}
            .checkAvailability=${this.__checkNextTransactionDateAvailability}
            @change=${(evt: Event) => {
              const target = evt.target as InternalCalendar;
              this.edit({ next_transaction_date: target.value });
            }}
          >
          </foxy-internal-calendar>
        </x-group>

        ${this.renderTemplateOrSlot('next-transaction-date:after')}
      </div>
    `;
  };

  private readonly __renderFrequencyAsDropdown = () => {
    const { data } = this;
    const active = !!data?.is_active;
    const items = this.__frequencies.map(v => ({
      label: this.t(v === '.5m' ? 'twice_a_month' : 'frequency', parseFrequency(v)),
      value: v,
    }));

    return html`
      <vaadin-combo-box
        item-value-path="value"
        item-label-path="label"
        data-testid="frequency"
        ?disabled=${!data || this.disabledSelector.matches('frequency', true)}
        ?readonly=${data && (!active || this.readonlySelector.matches('frequency', true))}
        class="w-full"
        label=${this.t('frequency_label').toString()}
        value=${ifDefined(this.form.frequency)}
        .items=${items}
        @change=${(evt: Event) => {
          this.edit({ frequency: (evt.target as HTMLInputElement).value });
        }}
      >
      </vaadin-combo-box>
    `;
  };

  private readonly __renderFrequencyAsRadioList = () => {
    const { data, lang, ns } = this;

    return html`
      <x-group frame>
        <foxy-i18n key="frequency_label" ns=${ns} lang=${lang} slot="header"></foxy-i18n>

        <x-choice
          default-custom-value="1d"
          data-testid="frequency"
          type="frequency"
          ns=${SubscriptionForm.defaultNS}
          ?custom=${this.settings === null}
          .items=${this.__frequencies}
          .value=${this.form.frequency ?? null}
          ?disabled=${!data || this.disabledSelector.matches('frequency', true)}
          ?readonly=${data && (!data.is_active || this.readonlySelector.matches('frequency', true))}
          @change=${(evt: Event) => {
            this.edit({ frequency: (evt.target as HTMLInputElement).value });
          }}
        >
          ${this.__frequencies.map(
            frequency => html`
              <foxy-i18n
                options=${JSON.stringify(parseFrequency(frequency))}
                slot="${frequency}-label"
                lang=${lang}
                key=${frequency === '.5m' ? 'twice_a_month' : 'frequency'}
                ns=${ns}
              >
              </foxy-i18n>
            `
          )}
        </x-choice>
      </x-group>
    `;
  };

  private readonly __renderFrequency = () => {
    return html`
      <div>
        ${this.renderTemplateOrSlot('frequency:before')}
        ${this.settings && this.__frequencies.length > 4
          ? this.__renderFrequencyAsDropdown()
          : this.__renderFrequencyAsRadioList()}
        ${this.renderTemplateOrSlot('frequency:after')}
      </div>
    `;
  };

  private readonly __transactionsTableColumns = [
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
  ];

  private readonly __renderTransactionsPage = ({ html, ...ctx }: PageRendererContext) => {
    return html`
      <foxy-table
        group=${ctx.group}
        lang=${ctx.lang}
        href=${ctx.href}
        ns="${ctx.ns} ${customElements.get('foxy-transactions-table')?.defaultNS ?? ''}"
        .columns=${this.__transactionsTableColumns}
      >
      </foxy-table>
    `;
  };

  private readonly __renderTransactions = () => {
    const { lang, ns } = this;

    return html`
      <div data-testid="transactions">
        ${this.renderTemplateOrSlot('transactions:before')}

        <x-group frame>
          <foxy-i18n lang=${lang} slot="header" key="transaction_plural" ns=${ns}></foxy-i18n>
          <foxy-collection-pages
            group=${this.group}
            class="block divide-y divide-contrast-10 px-m"
            first=${this.data?._links['fx:transactions'].href ?? ''}
            lang=${lang}
            ns=${ns}
            .page=${this.__renderTransactionsPage}
          >
          </foxy-collection-pages>
        </x-group>

        ${this.renderTemplateOrSlot('transactions:after')}
      </div>
    `;
  };

  render(): TemplateResult {
    const isBusy = this.in('busy');
    const isFail = this.in('fail');

    return html`
      <div
        data-testid="wrapper"
        aria-busy=${isBusy}
        aria-live="polite"
        class="relative space-y-l text-body font-lumo text-m leading-m"
      >
        ${this.hiddenSelector.matches('header', true) ? '' : this.__renderHeader()}
        ${this.hiddenSelector.matches('items', true) ? '' : this.__renderItems()}
        ${this.hiddenSelector.matches('end-date', true) ? '' : this.__renderEndDate()}
        ${this.__isNextTransactionDateVisible ? this.__renderNextTransactionDate() : ''}
        ${this.__isFrequencyVisible ? this.__renderFrequency() : ''}
        ${this.hiddenSelector.matches('transactions', true) ? '' : this.__renderTransactions()}

        <div
          data-testid="spinner"
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !isBusy && !isFail,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${isFail ? 'error' : isBusy ? 'busy' : 'empty'}
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  private get __isNextTransactionDateVisible() {
    if (this.hiddenSelector.matches('next-transaction-date', true)) return false;
    if (this.settings === null) return true;
    if (this.data === null) return false;

    const rules = this.settings.subscriptions.allow_next_date_modification;
    return !!getNextTransactionDateConstraints(this.data, rules);
  }

  private get __isFrequencyVisible() {
    if (this.hiddenSelector.matches('frequency', true)) return false;
    if (this.settings === null) return true;
    if (this.data === null) return false;

    const allowedFrequencies = getAllowedFrequencies({
      subscription: this.data,
      settings: this.settings,
    });

    return !allowedFrequencies.next().done;
  }

  private get __frequencies() {
    if (!this.settings || !this.data) return ['.5m', '1m', '1y'];

    const allowedFrequencies = getAllowedFrequencies({
      subscription: this.data,
      settings: this.settings,
    });

    return Array.from(allowedFrequencies);
  }
}
