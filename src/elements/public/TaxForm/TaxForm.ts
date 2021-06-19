import { CSSResult, CSSResultArray, TemplateResult, html } from 'lit-element';
import { Checkbox, I18N, PropertyTable } from '../../private';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
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
      'foxy-i18n': I18N,
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

  private static __ns = 'tax-form';

  private static __types = ['global', 'country', 'region', 'local', 'union'];

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = customElements
      .get('foxy-i18n')
      .onTranslationChange(() => this.requestUpdate());
    customElements.get('foxy-i18n').i18next.loadNamespaces(['country', 'region']);
  }

  render(): TemplateResult {
    const ns = TaxForm.__ns;
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
            label=${this.__t('name').toString()}
            value="${ifDefined(this.form.name)}"
          ></x-text-field>
          <x-combo-box
            class="flex-1"
            label=${this.__t('type').toString()}
            .items=${TaxForm.__types}
            value="${ifDefined(this.form.type)}"
          ></x-combo-box>
        </div>
        <div class="flex flex-wrap flex-auto max-w-full gap-s">
          <x-combo-box
            class="flex-1"
            label=${this.__t('country').toString()}
            .items=${countries.map(this.__tLabelValue)}
            value="${this.form.country}"
          ></x-combo-box>
          <x-combo-box
            class="flex-1"
            label=${this.__t('region')}
            .items=${regions.map(this.__tLabelValue)}
            value="${this.form.region}"
          ></x-combo-box>
          <x-text-field
            class="flex-1"
            label=${this.__t('city').toString()}
            value="${this.form.city ?? ''}"
          >
          </x-text-field>
        </div>
        <x-checkbox
          class="my-s"
          ?checked=${ifDefined(this.form.is_live)}
          @change=${(e: CustomEvent) => {
            this.edit({ is_live: e.detail });
          }}
        >
          <foxy-i18n lang=${this.lang} ns=${ns} key="is-live"></foxy-i18n>
        </x-checkbox>
        <div class="max-w-full border rounded-l border-contrast-10 p-s">
          ${this.form.is_live
            ? html` <x-combo-box
                class="flex-1"
                label=${this.__t('provider')}
                value="${ifDefined(this.form.service_provider)}"
                .items=${taxProviders.map(this.__tLabelValue)}
              >
              </x-combo-box>`
            : html`
                <x-text-field
                  label=${this.__t('rate').toString()}
                  .value="${ifDefined(this.form.rate)}"
                >
                </x-text-field>
                <x-checkbox class="my-s" ?checked=${ifDefined(this.form.apply_to_shipping)}>
                  <foxy-i18n lang=${this.lang} ns=${ns} key="apply-to-shipping"></foxy-i18n>
                </x-checkbox>
              `}
        </div>
        ${this.__shouldAskUseOrigin()
          ? html`
              <x-checkbox ?checked=${ifDefined(this.form.use_origin_rates)}>
                <foxy-i18n ns=${ns} lang=${this.lang} key="use-origin-rates"></foxy-i18n>
              </x-checkbox>
            `
          : ''}
        <x-checkbox class="my-s" ?checked=${ifDefined(this.form.exempt_all_customer_tax_ids)}>
          <foxy-i18n ns="${ns}" lang="${this.lang}" key="exempt-customers-with-tax-id"></foxy-i18n>
        </x-checkbox>
        <x-property-table
          .items=${(['date_modified', 'date_created'] as const).map(field => ({
            name: this.__t(field),
            value: this.data
              ? html`
                  <foxy-i18n key="date" options='{"value": "${this.data[field]}"}'></foxy-i18n>
                  <foxy-i18n key="time" options='{"value": "${this.data[field]}"}'></foxy-i18n>
                `
              : '',
          }))}
        >
        </x-property-table>
      `;
    }
  }

  private __shouldAskUseOrigin(): boolean {
    return (
      this.form &&
      (this.form as any).type === 'union' &&
      (this.form.service_provider as any) === 'thomson_reuters'
    );
  }

  private get __t(): (s: string) => string {
    return customElements
      .get('foxy-i18n')
      .i18next.getFixedT(this.lang, [TaxForm.__ns, 'country', 'region', 'shared']);
  }

  private get __tLabelValue(): (s: string) => { label: string; value: string } {
    return s => {
      return {
        label: this.__t(s).toString(),
        value: s,
      };
    };
  }
}
