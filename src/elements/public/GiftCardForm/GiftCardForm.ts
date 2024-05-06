import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-element';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Action } from '../../internal/InternalAsyncListControl/types';
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
 * @slot name:before
 * @slot name:after
 *
 * @slot currency:before
 * @slot currency:after
 *
 * @slot expires:before
 * @slot expires:after
 *
 * @slot codes:before
 * @slot codes:after
 *
 * @slot product-restrictions:before
 * @slot product-restrictions:after
 *
 * @slot category-restrictions:before
 * @slot category-restrictions:after
 *
 * @slot attributes:before - **new in v1.27.0**
 * @slot attributes:after - **new in v1.27.0**
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot delete:before
 * @slot delete:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @element foxy-gift-card-form
 * @since 1.15.0
 */
export class GiftCardForm extends Base<Data> {
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
    { label: 'code', path: 'code', type: Type.String },
    { label: 'current_balance', path: 'current_balance', type: Type.Number },
    { label: 'end_date', path: 'end_date', type: Type.Date },
    { label: 'date_created', path: 'date_created', type: Type.Date },
    { label: 'date_modified', path: 'date_modified', type: Type.Date },
  ];

  private __codesActions: Action<Resource<Rels.GiftCardCode>>[] = [
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

    return new BooleanSelector(alwaysMatch.join(' ').trim());
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

      <div class="grid grid-cols-1 sm-grid-cols-3 md-grid-cols-4 gap-m">
        <foxy-internal-text-control infer="name" class="md-col-span-2">
        </foxy-internal-text-control>

        <foxy-internal-select-control
          property="currency_code"
          infer="currency"
          .getValue=${this.__currencyCodeGetValue}
          .options=${currencies.map(value => ({
            label: this.t(`currency.code_${value}`),
            value,
          }))}
        >
        </foxy-internal-select-control>

        <foxy-internal-frequency-control property="expires_after" infer="expires">
        </foxy-internal-frequency-control>
      </div>

      <foxy-internal-gift-card-form-provisioning-control infer="provisioning">
      </foxy-internal-gift-card-form-provisioning-control>

      <foxy-internal-async-list-control
        first=${codesUrl}
        limit="5"
        infer="codes"
        item="foxy-gift-card-code-card"
        form="foxy-gift-card-code-form"
        alert
        .actions=${this.__codesActions}
        .filters=${this.__codesFilters}
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
