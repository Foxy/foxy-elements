import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { TransactionPageHrefGetter } from '../GiftCardCodeForm/types';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { SwipeAction } from '../../internal/InternalAsyncListControl/types';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Item } from '../../internal/InternalEditableListControl/types';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { Option, Type } from '../QueryBuilder/types';
import { html } from 'lit-element';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { currencies } from './currencies';
import { ifDefined } from 'lit-html/directives/if-defined';

const NS = 'gift-card-form';
const Base = ResponsiveMixin(TranslatableMixin(InternalForm, NS));

/**
 * Form element for creating or editing gift cards (`fx:gift_card`).
 *
 * @element foxy-gift-card-form
 * @since 1.15.0
 */
export class GiftCardForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      getTransactionPageHref: { attribute: false },
      getCustomerHref: { attribute: false },
      codesFilter: { attribute: 'codes-filter' },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name:v8n_required',
      ({ name: v }) => !v || v.length <= 50 || 'name:v8n_too_long',

      form => {
        if (form.provisioning_config?.allow_autoprovisioning) {
          if (!form.sku) return 'sku:v8n_required';
          if (form.sku.length > 200) return 'sku:v8n_too_long';
        }

        return true;
      },

      form => {
        const v = form.provisioning_config?.initial_balance_min;
        return typeof v === 'number' && v < 0 ? 'min-balance:v8n_negative' : true;
      },

      form => {
        const v = form.provisioning_config?.initial_balance_max;
        return typeof v === 'number' && v < 0 ? 'max-balance:v8n_negative' : true;
      },

      ({ product_code_restrictions: v }) => {
        return !v || v.length <= 5000 || 'product-code-restrictions:v8n_too_long';
      },
    ];
  }

  /** When set, the Cart Item section in Gift Card Code form will display a link to transaction. */
  getTransactionPageHref: TransactionPageHrefGetter | null = null;

  /** Returns a `fx:customer` Resource URL for a Customer ID. */
  getCustomerHref: (id: number | string) => string = id => {
    return `https://api.foxycart.com/customers/${id}`;
  };

  /** When set, will apply as default filter in Codes section. */
  codesFilter: string | null = null;

  private readonly __provisioningMaxBalanceValueGetter = () => {
    return this.form.provisioning_config?.initial_balance_max;
  };

  private readonly __provisioningMaxBalanceValueSetter = (newMax: number) => {
    const newMin = this.form.provisioning_config?.initial_balance_min ?? newMax;

    this.edit({
      provisioning_config: {
        allow_autoprovisioning: true,
        initial_balance_min: newMin > newMax ? newMax : newMin,
        initial_balance_max: newMax,
      },
    });
  };

  private readonly __provisioningMinBalanceValueGetter = () => {
    return this.form.provisioning_config?.initial_balance_min;
  };

  private readonly __provisioningMinBalanceValueSetter = (newMin: number) => {
    const newMax = this.form.provisioning_config?.initial_balance_max ?? newMin;

    this.edit({
      provisioning_config: {
        allow_autoprovisioning: true,
        initial_balance_min: newMin,
        initial_balance_max: newMax < newMin ? newMin : newMax,
      },
    });
  };

  private readonly __provisioningToggleValueGetter = () => {
    return !!this.form.provisioning_config?.allow_autoprovisioning;
  };

  private readonly __provisioningToggleValueSetter = (newValue: boolean) => {
    if (newValue) {
      this.edit({
        provisioning_config: {
          allow_autoprovisioning: true,
          initial_balance_min: this.form.provisioning_config?.initial_balance_min ?? 0,
          initial_balance_max: this.form.provisioning_config?.initial_balance_max ?? 0,
        },
      });
    } else {
      this.edit({ provisioning_config: null });
    }
  };

  private readonly __productCodeRestrictionsGetValue = () => {
    return this.form.product_code_restrictions
      ?.split(',')
      .filter(v => !!v.trim())
      .map(value => ({
        value,
        label: value.startsWith('-')
          ? this.t(`product-code-restrictions.label_block`, { value: value.substring(1) })
          : this.t(`product-code-restrictions.label_allow`, { value }),
      }));
  };

  private readonly __productCodeRestrictionsSetValue = (newValue: Item[]) => {
    this.edit({
      product_code_restrictions: newValue
        .map(({ value, unit }) => (unit === 'block' ? `-${value}` : value))
        .filter((v, i, a) => !!v && a.indexOf(v) === i)
        .join(','),
    });
  };

  private readonly __currencyCodeGetValue = () => {
    return this.form.currency_code?.toLowerCase();
  };

  private readonly __storeLoaderId = 'storeLoader';

  private readonly __codesFilters: Option[] = [
    { label: 'option_code', path: 'code', type: Type.String },
    { label: 'option_current_balance', path: 'current_balance', type: Type.Number },
    { label: 'option_end_date', path: 'end_date', type: Type.Date },
    { label: 'option_date_created', path: 'date_created', type: Type.Date },
    { label: 'option_date_modified', path: 'date_modified', type: Type.Date },
  ];

  private __codesActions: SwipeAction<Resource<Rels.GiftCardCode>>[] = [
    {
      theme: 'contrast',
      state: 'idle',
      text: 'copy_button_text',
      onClick: async data => {
        this.__codesActions[0].state = 'busy';
        this.__codesActions = [...this.__codesActions];

        try {
          await navigator.clipboard.writeText(data.code);
          this.__codesActions[0].state = 'end';
        } catch {
          this.__codesActions[0].state = 'error';
        } finally {
          this.__codesActions = [...this.__codesActions];
          setTimeout(() => {
            this.__codesActions[0].state = 'idle';
            this.__codesActions = [...this.__codesActions];
          }, 1000);
        }
      },
    },
  ];

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];

    if (!this.data) {
      alwaysMatch.push('codes', 'category-restrictions', 'attributes');
    }

    if (!this.form.provisioning_config?.allow_autoprovisioning) {
      alwaysMatch.push('provisioning:sku', 'provisioning:min-balance', 'provisioning:max-balance');
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get headerSubtitleOptions(): Record<string, unknown> {
    return { id: this.headerCopyIdValue };
  }

  renderHeaderActions(data: Data): TemplateResult {
    return html`
      <foxy-internal-bulk-add-action-control
        parent=${data._links['fx:generate_codes'].href}
        infer="generate"
        form="foxy-generate-codes-form"
        .related=${[data._links['fx:gift_card_codes'].href]}
      >
      </foxy-internal-bulk-add-action-control>

      <foxy-internal-bulk-add-action-control
        parent=${data._links['fx:gift_card_codes'].href}
        infer="import"
        form="foxy-gift-card-codes-form"
        .related=${[data._links['fx:gift_card_codes'].href]}
      >
      </foxy-internal-bulk-add-action-control>

      ${super.renderHeaderActions(data)}
    `;
  }

  renderBody(): TemplateResult {
    let codesUrl: string | undefined;

    try {
      const url = new URL(this.data?._links['fx:gift_card_codes'].href ?? '');
      url.searchParams.set('order', 'date_created desc');

      codesUrl = url.toString();
    } catch {
      codesUrl = undefined;
    }

    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="name">
        </foxy-internal-text-control>

        <foxy-internal-select-control
          property="currency_code"
          layout="summary-item"
          infer="currency"
          .getValue=${this.__currencyCodeGetValue}
          .options=${currencies.map(value => ({
            label: this.t(`general.currency.code_${value}`),
            value,
          }))}
        >
        </foxy-internal-select-control>

        <foxy-internal-frequency-control
          property="expires_after"
          layout="summary-item"
          infer="expires"
        >
        </foxy-internal-frequency-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="provisioning">
        <foxy-internal-switch-control
          infer="toggle"
          .getValue=${this.__provisioningToggleValueGetter}
          .setValue=${this.__provisioningToggleValueSetter}
        >
        </foxy-internal-switch-control>

        <foxy-internal-text-control layout="summary-item" infer="sku"></foxy-internal-text-control>

        <foxy-internal-number-control
          layout="summary-item"
          suffix=${ifDefined(this.form.currency_code?.toUpperCase())}
          infer="min-balance"
          min="0"
          .getValue=${this.__provisioningMinBalanceValueGetter}
          .setValue=${this.__provisioningMinBalanceValueSetter}
        >
        </foxy-internal-number-control>

        <foxy-internal-number-control
          layout="summary-item"
          suffix=${ifDefined(this.form.currency_code?.toUpperCase())}
          infer="max-balance"
          min="0"
          .getValue=${this.__provisioningMaxBalanceValueGetter}
          .setValue=${this.__provisioningMaxBalanceValueSetter}
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      <foxy-internal-async-list-control
        filter=${ifDefined(this.codesFilter ?? void 0)}
        first=${codesUrl}
        limit="5"
        infer="codes"
        item="foxy-gift-card-code-card"
        form="foxy-gift-card-code-form"
        alert
        .actions=${this.__codesActions}
        .filters=${this.__codesFilters}
        .formProps=${{
          '.getTransactionPageHref': this.getTransactionPageHref,
          '.getCustomerHref': this.getCustomerHref,
        }}
      >
      </foxy-internal-async-list-control>

      <foxy-internal-editable-list-control
        infer="product-code-restrictions"
        .getValue=${this.__productCodeRestrictionsGetValue}
        .setValue=${this.__productCodeRestrictionsSetValue}
        .units=${[
          { label: this.t('product-code-restrictions.unit_allow'), value: 'allow' },
          { label: this.t('product-code-restrictions.unit_block'), value: 'block' },
        ]}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-async-resource-link-list-control
        foreign-key-for-uri="item_category_uri"
        foreign-key-for-id="item_category_id"
        own-key-for-uri="gift_card_uri"
        options-href=${ifDefined(this.__storeLoader?.data?._links['fx:item_categories'].href)}
        links-href=${ifDefined(this.data?._links['fx:gift_card_item_categories'].href)}
        embed-key="fx:gift_card_item_categories"
        own-uri=${ifDefined(this.data?._links.self.href)}
        infer="category-restrictions"
        limit="5"
        item="foxy-item-category-card"
      >
      </foxy-internal-async-resource-link-list-control>

      <foxy-internal-async-list-control
        first=${ifDefined(this.data?._links['fx:attributes'].href)}
        limit="5"
        infer="attributes"
        item="foxy-attribute-card"
        form="foxy-attribute-form"
        alert
      >
      </foxy-internal-async-list-control>

      ${super.renderBody()}

      <foxy-nucleon
        infer=""
        class="hidden"
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
