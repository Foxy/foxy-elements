import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { ExperimentalAddToCartBuilder } from '../../ExperimentalAddToCartBuilder';
import type { DiscountBuilder } from '../../../DiscountBuilder/DiscountBuilder';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from '../../types';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalExperimentalAddToCartBuilderItemControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      itemCategories: { attribute: 'item-categories' },
      currencyCode: { attribute: 'currency-code' },
      index: { type: Number },
      store: {},
    };
  }

  itemCategories: string | null = null;

  currencyCode: string | null = null;

  index = 0;

  renderControl(): TemplateResult {
    const itemCategory = this.__itemCategoryLoader?.data;
    const nucleon = this.nucleon as ExperimentalAddToCartBuilder | null;
    const index = this.index;
    const item = nucleon?.form.items?.[index];

    return html`
      <div class="space-y-m">
        <foxy-internal-summary-control infer="basics-group">
          <foxy-internal-text-control
            property="items.${index}.name"
            layout="summary-item"
            infer="name"
          >
          </foxy-internal-text-control>

          <foxy-internal-resource-picker-control
            property="items.${index}.item_category_uri"
            layout="summary-item"
            first=${ifDefined(this.itemCategories ?? void 0)}
            infer="item-category-uri"
            item="foxy-item-category-card"
          >
          </foxy-internal-resource-picker-control>
        </foxy-internal-summary-control>

        <foxy-internal-summary-control infer="price-group">
          <foxy-internal-number-control
            property="items.${index}.price"
            layout="summary-item"
            suffix=${ifDefined(this.currencyCode ?? void 0)}
            infer=${item?.price_configurable ? 'price-default' : 'price'}
          >
          </foxy-internal-number-control>

          <foxy-internal-switch-control
            property="items.${index}.price_configurable"
            layout="summary-item"
            infer="price-configurable"
          >
          </foxy-internal-switch-control>
        </foxy-internal-summary-control>

        <foxy-internal-summary-control infer="code-group">
          <foxy-internal-text-control
            property="items.${index}.code"
            layout="summary-item"
            infer="code"
          >
          </foxy-internal-text-control>

          <foxy-internal-text-control
            property="items.${index}.parent_code"
            layout="summary-item"
            infer="parent-code"
          >
          </foxy-internal-text-control>
        </foxy-internal-summary-control>

        <foxy-internal-summary-control infer="appearance-group" layout="details">
          <foxy-internal-text-control
            property="items.${index}.image"
            layout="summary-item"
            infer="image"
          >
          </foxy-internal-text-control>

          ${item?.image
            ? html`
                <foxy-internal-text-control
                  property="items.${index}.url"
                  layout="summary-item"
                  infer="url"
                >
                </foxy-internal-text-control>
              `
            : ''}
        </foxy-internal-summary-control>

        <foxy-internal-summary-control infer="subscriptions-group" layout="details">
          <foxy-internal-switch-control
            property="items.${index}.sub_enabled"
            layout="summary-item"
            infer="sub-enabled"
          >
          </foxy-internal-switch-control>

          ${item?.sub_enabled
            ? html`
                <foxy-internal-frequency-control
                  property="items.${index}.sub_frequency"
                  layout="summary-item"
                  infer="sub-frequency"
                >
                </foxy-internal-frequency-control>

                <foxy-internal-select-control
                  property="items.${index}.sub_startdate_format"
                  layout="summary-item"
                  infer="sub-startdate-format"
                  .options=${[
                    { label: 'option_none', value: 'none' },
                    { label: 'option_yyyymmdd', value: 'yyyymmdd' },
                    { label: 'option_dd', value: 'dd' },
                    { label: 'option_duration', value: 'duration' },
                  ]}
                >
                </foxy-internal-select-control>

                ${item.sub_startdate_format === 'yyyymmdd'
                  ? html`
                      <foxy-internal-date-control
                        property="items.${index}.sub_startdate"
                        layout="summary-item"
                        infer="sub-startdate-yyyymmdd"
                      >
                      </foxy-internal-date-control>
                    `
                  : item.sub_startdate_format === 'duration'
                  ? html`
                      <foxy-internal-frequency-control
                        property="items.${index}.sub_startdate"
                        layout="summary-item"
                        infer="sub-startdate-duration"
                      >
                      </foxy-internal-frequency-control>
                    `
                  : item.sub_startdate_format === 'dd'
                  ? html`
                      <foxy-internal-number-control
                        property="items.${index}.sub_startdate"
                        layout="summary-item"
                        infer="sub-startdate-dd"
                        step="1"
                        min="1"
                        max="31"
                      >
                      </foxy-internal-number-control>
                    `
                  : ''}

                <foxy-internal-select-control
                  property="items.${index}.sub_enddate_format"
                  layout="summary-item"
                  infer="sub-enddate-format"
                  .options=${[
                    { label: 'option_none', value: 'none' },
                    { label: 'option_yyyymmdd', value: 'yyyymmdd' },
                    { label: 'option_duration', value: 'duration' },
                  ]}
                >
                </foxy-internal-select-control>

                ${item.sub_enddate_format === 'yyyymmdd'
                  ? html`
                      <foxy-internal-date-control
                        property="items.${index}.sub_enddate"
                        layout="summary-item"
                        infer="sub-enddate-yyyymmdd"
                      >
                      </foxy-internal-date-control>
                    `
                  : item.sub_enddate_format === 'duration'
                  ? html`
                      <foxy-internal-frequency-control
                        property="items.${index}.sub_enddate"
                        layout="summary-item"
                        infer="sub-enddate-duration"
                      >
                      </foxy-internal-frequency-control>
                    `
                  : ''}
              `
            : ''}
        </foxy-internal-summary-control>

        <foxy-internal-summary-control infer="discount-group" layout="details">
          <foxy-internal-text-control
            property="items.${index}.discount_name"
            layout="summary-item"
            infer="discount-name"
          >
          </foxy-internal-text-control>

          ${item?.discount_name
            ? html`
                <foxy-discount-builder
                  infer="discount-builder"
                  .parsedValue=${{
                    details: item?.discount_details ?? '',
                    type: item?.discount_type ?? 'discount_amount_percentage',
                    name: item?.discount_name ?? '',
                  }}
                  @change=${(evt: CustomEvent) =>
                    this.__handleDiscountBuilderChange(evt, item, index)}
                >
                </foxy-discount-builder>
              `
            : ''}
        </foxy-internal-summary-control>

        <foxy-internal-summary-control infer="expires-group" layout="details">
          <foxy-internal-select-control
            property="items.${index}.expires_format"
            layout="summary-item"
            infer="expires-format"
            .options=${[
              { label: 'option_none', value: 'none' },
              { label: 'option_minutes', value: 'minutes' },
              { label: 'option_timestamp', value: 'timestamp' },
            ]}
          >
          </foxy-internal-select-control>

          ${item?.expires_format === 'minutes'
            ? html`
                <foxy-internal-number-control
                  property="items.${index}.expires_value"
                  layout="summary-item"
                  suffix="min"
                  infer="expires-value-minutes"
                >
                </foxy-internal-number-control>
              `
            : item?.expires_format === 'timestamp'
            ? html`
                <foxy-internal-date-control
                  property="items.${index}.expires_value"
                  layout="summary-item"
                  format="unix"
                  infer="expires-value-timestamp"
                >
                </foxy-internal-date-control>
              `
            : ''}
        </foxy-internal-summary-control>

        <foxy-internal-summary-control infer="quantity-group" layout="details">
          <foxy-internal-number-control
            property="items.${index}.quantity"
            layout="summary-item"
            infer="quantity"
            step="1"
            min="1"
          >
          </foxy-internal-number-control>

          ${item?.expires_format === 'minutes'
            ? ''
            : html`
                <foxy-internal-number-control
                  property="items.${index}.quantity_min"
                  layout="summary-item"
                  infer="quantity-min"
                  step="1"
                  min="1"
                >
                </foxy-internal-number-control>

                <foxy-internal-number-control
                  property="items.${index}.quantity_max"
                  layout="summary-item"
                  infer="quantity-max"
                  step="1"
                  min="1"
                >
                </foxy-internal-number-control>
              `}
        </foxy-internal-summary-control>

        <foxy-internal-summary-control infer="dimensions-group" layout="details">
          <foxy-internal-number-control
            placeholder=${ifDefined(itemCategory?.default_weight)}
            property="items.${index}.weight"
            layout="summary-item"
            suffix=${ifDefined(itemCategory?.default_weight_unit)}
            infer="weight"
            min="0"
          >
          </foxy-internal-number-control>

          <foxy-internal-number-control
            property="items.${index}.length"
            layout="summary-item"
            suffix=${ifDefined(itemCategory?.default_length_unit)}
            infer="length"
            min="0"
          >
          </foxy-internal-number-control>

          <foxy-internal-number-control
            property="items.${index}.width"
            layout="summary-item"
            suffix=${ifDefined(itemCategory?.default_length_unit)}
            infer="width"
            min="0"
          >
          </foxy-internal-number-control>

          <foxy-internal-number-control
            property="items.${index}.height"
            layout="summary-item"
            suffix=${ifDefined(itemCategory?.default_length_unit)}
            infer="height"
            min="0"
          >
          </foxy-internal-number-control>
        </foxy-internal-summary-control>

        <foxy-internal-async-list-control
          first="foxy://${nucleon?.virtualHost}/form/items/${index}/custom_options"
          infer="custom-options"
          form="foxy-internal-experimental-add-to-cart-builder-custom-option-form"
          item="foxy-internal-experimental-add-to-cart-builder-custom-option-card"
          alert
          .formProps=${{
            '.defaultWeightUnit': itemCategory?.default_weight_unit,
            '.existingOptions': item?.custom_options ?? [],
            '.itemCategories': this.itemCategories,
            '.currencyCode': this.currencyCode,
          }}
        >
        </foxy-internal-async-list-control>

        ${nucleon?.form.items?.length === 1
          ? html``
          : html`
              <vaadin-button
                theme="error"
                class="w-full"
                ?disabled=${this.disabled}
                @click=${() => this.dispatchEvent(new CustomEvent('remove'))}
              >
                <foxy-i18n infer="delete" key="caption"></foxy-i18n>
              </vaadin-button>
            `}

        <foxy-nucleon
          infer=""
          class="hidden"
          href=${ifDefined(item?.item_category_uri)}
          id="itemCategoryLoader"
          @update=${() => this.requestUpdate()}
        >
        </foxy-nucleon>
      </div>
    `;
  }

  private get __itemCategoryLoader() {
    type Loader = NucleonElement<Resource<Rels.ItemCategory>>;
    return this.renderRoot.querySelector<Loader>('#itemCategoryLoader');
  }

  private __handleDiscountBuilderChange(
    evt: CustomEvent,
    item: Data['items'][number],
    index: number
  ) {
    const builder = evt.currentTarget as DiscountBuilder;
    const nucleon = this.nucleon as ExperimentalAddToCartBuilder | null;

    item.discount_details = builder.parsedValue.details;
    item.discount_type = builder.parsedValue.type;
    item.discount_name = builder.parsedValue.name;

    const items = nucleon?.form.items ?? [];
    items.splice(index, 1, item);
    nucleon?.edit({ items: [...items] });
  }
}
