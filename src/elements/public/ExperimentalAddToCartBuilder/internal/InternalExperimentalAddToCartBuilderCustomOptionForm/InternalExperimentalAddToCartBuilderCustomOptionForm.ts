import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'internal-experimental-add-to-cart-builder-custom-option-form';
const Base = TranslatableMixin(InternalForm, NS);

export class InternalExperimentalAddToCartBuilderCustomOptionForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      defaultWeightUnit: { attribute: 'default-weight-unit' },
      existingOptions: { type: Array, attribute: 'existing-options' },
      itemCategories: { attribute: 'item-categories' },
      currencyCode: { attribute: 'currency-code' },
    };
  }

  defaultWeightUnit: string | null = null;

  existingOptions: Omit<Data, '_links'>[] = [];

  itemCategories: string | null = null;

  currencyCode: string | null = null;

  private readonly __nameSetValue = (newValue: string) => {
    this.edit({ name: newValue });
    if (this.__isAlternative) this.edit({ value_configurable: false, required: false });
  };

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = [super.readonlySelector.toString()];
    if (this.__isAlternative) alwaysMatch.unshift('basics-group:value-configurable');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];

    if (this.form.value_configurable) {
      alwaysMatch.unshift('price-group', 'weight-group', 'code-group', 'category-group');
    } else {
      alwaysMatch.unshift('basics-group:required');
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-summary-control infer="basics-group">
        <foxy-internal-text-control
          layout="summary-item"
          infer="name"
          .setValue=${this.__nameSetValue}
          @keydown=${(evt: KeyboardEvent) => {
            if (!['ArrowUp', 'ArrowDown'].includes(evt.key)) return;
            evt.preventDefault();

            const existingNames = this.existingOptions
              .map(option => option.name)
              .filter((v, i, a) => a.indexOf(v) === i);

            const currentIndex = existingNames.indexOf(this.form.name ?? '');
            let nextIndex = evt.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1;
            if (nextIndex < 0) nextIndex = existingNames.length - 1;
            if (nextIndex >= existingNames.length) nextIndex = 0;

            const nextName = existingNames[nextIndex];
            if (nextName && nextName !== this.form.name) this.edit({ name: nextName });
          }}
        >
        </foxy-internal-text-control>

        <foxy-internal-text-control
          property="value"
          layout="summary-item"
          infer=${this.form.value_configurable ? 'default-value' : 'value'}
        >
        </foxy-internal-text-control>

        <foxy-internal-switch-control
          helper-text=${ifDefined(this.__isAlternative ? void 0 : '')}
          infer="value-configurable"
          helper-text-as-tooltip
        >
        </foxy-internal-switch-control>

        <foxy-internal-switch-control infer="required" helper-text-as-tooltip>
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="price-group">
        <foxy-internal-number-control
          layout="summary-item"
          suffix=${ifDefined(this.currencyCode ?? void 0)}
          infer="price"
        >
        </foxy-internal-number-control>
        <foxy-internal-switch-control infer="replace-price"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="weight-group">
        <foxy-internal-number-control
          layout="summary-item"
          suffix=${ifDefined(this.__resolvedDefaultWeightUnit ?? void 0)}
          infer="weight"
        >
        </foxy-internal-number-control>
        <foxy-internal-switch-control infer="replace-weight"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="code-group">
        <foxy-internal-text-control layout="summary-item" infer="code">
        </foxy-internal-text-control>
        <foxy-internal-switch-control infer="replace-code"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="category-group">
        <foxy-internal-resource-picker-control
          layout="summary-item"
          first=${ifDefined(this.itemCategories ?? undefined)}
          infer="item-category-uri"
          item="foxy-item-category-card"
        >
        </foxy-internal-resource-picker-control>
      </foxy-internal-summary-control>

      <foxy-nucleon
        infer=""
        class="hidden"
        href=${ifDefined(this.form.item_category_uri ?? void 0)}
        id="itemCategoryLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      ${super.renderBody()}
    `;
  }

  protected async _sendPost(edits: Partial<Data>): Promise<Data> {
    const existingOptions = this.existingOptions.filter(o => o.name === edits.name);

    if (existingOptions.some(o => o.value_configurable)) {
      throw ['error:option_exists_configurable'];
    }

    if (existingOptions.some(o => o.value === edits.value)) {
      throw ['error:option_exists'];
    }

    return super._sendPost(edits);
  }

  private get __resolvedDefaultWeightUnit() {
    type Loader = NucleonElement<Resource<Rels.ItemCategory>>;
    const loader = this.renderRoot.querySelector<Loader>('#itemCategoryLoader');
    return loader?.data?.default_weight_unit ?? this.defaultWeightUnit;
  }

  private get __isAlternative() {
    const existing = this.existingOptions.filter(o => o.name === this.form.name);
    return this.href ? existing.length > 1 : existing.length > 0;
  }
}
