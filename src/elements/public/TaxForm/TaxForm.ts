import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { CSSResult, CSSResultArray, TemplateResult, html } from 'lit-element';
import { Checkbox, PropertyTable } from '../../private';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { Data } from './types';
import { NucleonElement } from '../NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { Themeable } from '../../../mixins/themeable';
import { countries } from '../../../utils/countries';
import { ifDefined } from 'lit-html/directives/if-defined';
import { regions } from '../../../utils/regions';
import { taxProviders } from './providers';

export class TaxForm extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-spinner': customElements.get('foxy-spinner'),
      'x-checkbox': Checkbox,
      'x-combo-box': ComboBoxElement,
      'x-property-table': PropertyTable,
      'x-text-field': TextFieldElement,
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => (v && v.length <= 30) || 'name_too_long',
      ({ type: v }) => (v && TaxForm.__types.includes(v)) || 'type_unknown',
      ({ country: v }) => !v || !!v.match(/[A-Z]{2}/) || 'country_unknown',
      ({ region: v }) => !v || v.length <= 20 || 'region_too_long',
      ({ city: v }) => !v || v.length <= 20 || 'city_too_long',
      ({ city: c, type: t }) => (t == 'local' && c) || t != 'local' || 'city_too_long',
      ({ service_provider: v }) => !v || v == 'avalara' || 'unknown_provider',
      ({ rate: v }) => (v && v <= 100) || 'invalid_percentage',
    ];
  }

  private static __types = ['global', 'country', 'region', 'local', 'union'];

  render(): TemplateResult {
    if (!this.in('idle')) {
      return html`
        <div class="absolute inset-0 flex items-center justify-center">
          <foxy-spinner
            data-testid="spinner"
            class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            layout="horizontal"
            state=${this.in('busy') ? 'busy' : 'error'}
          >
          </foxy-spinner>
        </div>
      `;
    } else {
      return html`
        <div class="flex flex-wrap flex-auto max-w-full gap-s">
          <x-text-field
            class="flex-1"
            label="name"
            value="${ifDefined(this.form.name)}"
          ></x-text-field>
          <x-combo-box
            class="flex-1"
            label="type"
            .items=${TaxForm.__types}
            value="${ifDefined(this.form.type)}"
          ></x-combo-box>
        </div>
        <div class="flex flex-wrap flex-auto max-w-full gap-s">
          <x-combo-box
            class="flex-1"
            label="country"
            .items=${countries}
            value="${this.form.country}"
          ></x-combo-box>
          <x-combo-box
            class="flex-1"
            label="region"
            .items=${regions}
            value="${this.form.region}"
          ></x-combo-box>
          <x-text-field class="flex-1" label="city" value="${this.form.city}"></x-text-field>
        </div>
        <x-checkbox
          class="mt-s"
          ?checked=${ifDefined(this.form.is_live)}
          @change=${(e: CustomEvent) => {
            this.edit({ is_live: e.detail });
          }}
        >
          is live
        </x-checkbox>
        <div class="max-w-full">
          ${this.form.is_live
            ? html` <x-combo-box
                class="flex-1"
                label="provider"
                value="${ifDefined(this.form.service_provider)}"
                .items=${taxProviders}
              >
              </x-combo-box>`
            : html`
                <x-text-field label="rate" .value="${ifDefined(this.form.rate)}"> </x-text-field>
                <x-checkbox ?checked=${ifDefined(this.form.apply_to_shipping)}>
                  apply to shipping
                </x-checkbox>
              `}
        </div>
        ${this.__shouldAskUseOrigin()
          ? html`
              <x-checkbox ?checked=${ifDefined(this.form.use_origin_rates)}>
                use origin rates
              </x-checkbox>
            `
          : ''}
        <x-checkbox ?checked=${ifDefined(this.form.exempt_all_customer_tax_ids)}>
          exempt customers with a tax id
        </x-checkbox>
        <x-property-table
          .items=${(['date_modified', 'date_created'] as const).map(field => ({
            name: field,
            value: this.data ? this.data[field] : '',
          }))}
        >
        </x-property-table>
        ${this.form.type} ${this.form.service_provider}
      `;
    }
  }

  private __shouldAskUseOrigin(): boolean {
    return (
      this.form && this.form.type == 'union' && this.form.service_provider == 'thomson_reuters'
    );
  }
}
