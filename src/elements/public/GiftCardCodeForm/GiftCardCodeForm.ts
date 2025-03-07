import type { PropertyDeclarations } from 'lit-element';
import type { Data, TransactionPageHrefGetter } from './types';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { BooleanSelector, getResourceId } from '@foxy.io/sdk/core';
import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { Option, Type } from '../QueryBuilder/types';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'gift-card-code-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for creating or editing gift card codes (`fx:gift_card_code`).
 *
 * @element foxy-gift-card-code-form
 * @since 1.15.0
 */
export class GiftCardCodeForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getTransactionPageHref: { attribute: false },
      getCustomerHref: { attribute: false },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ code: v }) => !!v || 'code:v8n_required',
      ({ code: v }) => !v || v.length <= 50 || 'code:v8n_too_long',
      ({ code: v }) => !v?.includes(' ') || 'code:v8n_has_spaces',
      ({ current_balance: v }) => typeof v === 'number' || 'current-balance:v8n_required',
    ];
  }

  /** When set, the Cart Item section will display a link to transaction. */
  getTransactionPageHref: TransactionPageHrefGetter | null = null;

  /** Returns a `fx:customer` Resource URL for a Customer ID. */
  getCustomerHref: (id: number | string) => string = id => {
    return `https://api.foxycart.com/customers/${id}`;
  };

  private readonly __cartItemGetItemUrl = (_: string, data: Resource<Rels.Item> | null) => {
    let itemUrl: string | undefined | null = null;

    try {
      const transactionUrl = data?._links['fx:transaction'].href;
      if (transactionUrl) itemUrl = this.getTransactionPageHref?.(transactionUrl);
    } catch (err) {
      console.log(err);
    }

    return itemUrl ?? null;
  };

  private readonly __customerGetValue = () => {
    const link = this.data?._links?.['fx:customer']?.href;
    const id = this.form.customer_id;
    return id === undefined ? link : this.getCustomerHref(id);
  };

  private readonly __customerSetValue = (v: string) => {
    const id = getResourceId(v);
    this.edit({ customer_id: typeof id === 'number' ? id : '' });
  };

  private readonly __customerFilters: Option[] = [
    { type: Type.String, path: 'id', label: 'filters.id' },
    { type: Type.String, path: 'tax_id', label: 'filters.tax_id' },
    { type: Type.String, path: 'email', label: 'filters.email' },
    { type: Type.String, path: 'first_name', label: 'filters.first_name' },
    { type: Type.String, path: 'last_name', label: 'filters.last_name' },
    {
      type: Type.Boolean,
      path: 'is_anonymous',
      label: 'filters.is_anonymous',
      list: [
        { label: 'filters.is_anonymous_true', value: 'true' },
        { label: 'filters.is_anonymous_false', value: 'false' },
      ],
    },
    { type: Type.Date, path: 'last_login_date', label: 'filters.last_login_date' },
    { type: Type.Date, path: 'date_created', label: 'filters.date_created' },
    { type: Type.Date, path: 'date_modified', label: 'filters.date_modified' },
  ];

  private readonly __storeLoaderId = 'storeLoader';

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString(), 'cart-item'];
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];
    if (!this.href) alwaysMatch.push('customer', 'cart-item', 'logs');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    let href: string | undefined;

    try {
      const url = new URL(
        this.data?._links?.['fx:provisioned_by_transaction_detail_id'].href ?? ''
      );
      url.searchParams.set('zoom', 'item_options');
      href = url.toString();
    } catch {
      href = undefined;
    }

    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="settings">
        <foxy-internal-text-control layout="summary-item" infer="code"></foxy-internal-text-control>
        <foxy-internal-number-control layout="summary-item" infer="current-balance">
        </foxy-internal-number-control>
        <foxy-internal-date-control layout="summary-item" format="iso-long" infer="end-date">
        </foxy-internal-date-control>
      </foxy-internal-summary-control>

      <foxy-internal-resource-picker-control
        infer="customer"
        first=${ifDefined(this.__storeLoader?.data?._links['fx:customers'].href)}
        item="foxy-customer-card"
        .getValue=${this.__customerGetValue}
        .setValue=${this.__customerSetValue}
        .filters=${this.__customerFilters}
      >
      </foxy-internal-resource-picker-control>

      <foxy-internal-resource-picker-control
        infer="cart-item"
        item="foxy-item-card"
        .getItemUrl=${this.__cartItemGetItemUrl}
        .getValue=${() => href}
      >
      </foxy-internal-resource-picker-control>

      <foxy-internal-async-list-control
        infer="logs"
        first=${ifDefined(this.data?._links?.['fx:gift_card_code_logs'].href)}
        limit="5"
        item="foxy-gift-card-code-log-card"
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}

      <foxy-nucleon
        infer=""
        href=${ifDefined(this.data?._links['fx:store'].href)}
        id=${this.__storeLoaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __storeLoader() {
    type Loader = NucleonElement<Resource<Rels.Store>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__storeLoaderId}`);
  }
}
