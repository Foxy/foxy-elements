import { CSSResult, CSSResultArray, TemplateResult, html } from 'lit-element';
import { Checkbox, I18N, PropertyTable } from '../../private';
import { Interpreter, createMachine, interpret } from 'xstate';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { Data } from './types';
import { NucleonElement } from '../NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { Themeable } from '../../../mixins/themeable';
import { countries } from '../../../utils/countries';
import { globalRegions } from '../../../utils/regions';
import { ifDefined } from 'lit-html/directives/if-defined';
import { taxMachine } from './machine';
import { taxProviders } from './providers';

export class TaxForm extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-i18n': I18N,
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
      ({ service_provider: v }) => !v || taxProviders.includes(v) || 'unknown_provider',
      ({ rate: v }) => (v && v <= 100) || 'invalid_percentage',
    ];
  }

  private static __ns = 'tax-form';

  private static __types = ['global', 'country', 'region', 'local', 'union'];

  private __taxMachine = createMachine(taxMachine as any);

  private __taxService: Interpreter<any, any, any, { value: any; context: any }> | undefined;

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__taxService = interpret(this.__taxMachine);
    this.__taxService.start();
    this.__untrackTranslations = customElements
      .get('foxy-i18n')
      .onTranslationChange(() => this.requestUpdate());
    customElements.get('foxy-i18n').i18next.loadNamespaces(['country']);
  }

  requestUpdate(name?: string | number | symbol | undefined, oldValue?: unknown): Promise<unknown> {
    const r = super.requestUpdate(name, oldValue);
    this.updateFields();
    return r;
  }

  updateFields(): void {
    this.__updateScope();
    this.__updateMode();
    this.__updateCountries();
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
            data-testid="name"
            class="flex-1"
            label=${this.__t('name').toString()}
            value="${ifDefined(this.form.name)}"
          ></x-text-field>
          <x-combo-box
            data-testid="type"
            class="flex-1"
            label=${this.__t('type').toString()}
            .items=${TaxForm.__types.map(this.__tLabelValue)}
            value=${ifDefined(this.form.type)}
            @value-changed="${this.__handleTypeChange}"
          ></x-combo-box>
        </div>
        <div class="flex flex-wrap flex-auto max-w-full gap-s">
          ${this.__taxMachine.context.country
            ? html`
                <x-combo-box
                  data-testid="country"
                  class="flex-1"
                  label=${this.__tSource('country')('country')}
                  .items=${countries.map(this.__tSourceLabelValue('country'))}
                  value="${this.form.country}"
                  @value-changed="${this.__handleCountryChange}"
                ></x-combo-box>
              `
            : ''}
          ${this.__taxMachine.context.region
            ? html`
                <x-combo-box
                  class="flex-1"
                  label=${this.__tSource('region')('region')}
                  .items=${this.__getRegions().map(
                    this.__tSourceLabelValue(`region-${this.form.country?.toLowerCase()}`)
                  )}
                  value="${ifDefined(this.form.region)}"
                  @value-changed="${this.__handleRegionChange}"
                ></x-combo-box>
              `
            : ''}
          ${this.__taxMachine.context.city
            ? html`
                <x-text-field
                  class="flex-1"
                  label=${this.__t('city').toString()}
                  value="${this.form.city ?? ''}"
                  @change=${this.__handleCityChange}
                >
                </x-text-field>
              `
            : ''}
        </div>
        ${this.__taxMachine.context.isLiveShow
          ? html`
              <x-checkbox
                class="my-s"
                ?checked=${ifDefined(this.form.is_live)}
                @change=${this.__handleIsLive}
              >
                <foxy-i18n lang=${this.lang} ns=${ns} key="is-live"></foxy-i18n>
              </x-checkbox>
            `
          : ''}
        <div class="max-w-full border rounded-l border-contrast-10 p-s">
          ${this.__taxMachine.context.provider
            ? html` <x-combo-box
                class="flex-1"
                label=${this.__t('provider')}
                value="${ifDefined(this.form.service_provider)}"
                .items=${taxProviders
                  .filter(i => this.__taxMachine.context.providerValues[i])
                  .map(this.__tLabelValue)}
                @value-changed=${this.__handleProviderChange}
              >
              </x-combo-box>`
            : html`<x-text-field
                label=${this.__t('rate').toString()}
                .value="${ifDefined(this.form.rate)}"
                @change=${console.log}
              >
              </x-text-field>`}
          ${this.__taxMachine.context.exemptShow
            ? html`
                <x-checkbox
                  class="my-s"
                  ?checked=${ifDefined(this.form.exempt_all_customer_tax_ids)}
                  @change=${console.log}
                >
                  <foxy-i18n
                    ns="${ns}"
                    lang="${this.lang}"
                    key="exempt-customers-with-tax-id"
                  ></foxy-i18n>
                </x-checkbox>
              `
            : ''}
        </div>
        ${this.__taxMachine.context.originShow
          ? html`
              <x-checkbox ?checked=${ifDefined(this.form.use_origin_rates)} @change=${console.log}>
                <foxy-i18n ns=${ns} lang=${this.lang} key="use-origin-rates"></foxy-i18n>
              </x-checkbox>
            `
          : ''}
        ${this.__taxMachine.context.apply
          ? html` <x-checkbox
              @change=${console.log}
              class="my-s"
              ?checked=${ifDefined(this.form.apply_to_shipping)}
            >
              <foxy-i18n lang=${this.lang} ns=${ns} key="apply-to-shipping"></foxy-i18n>
            </x-checkbox>`
          : ''}
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
    return this.__tSource(undefined);
  }

  private __tSource(source: undefined | string | string[]): (s: string) => string {
    if (source === undefined) {
      source = [TaxForm.__ns, 'shared'];
    }
    return customElements.get('foxy-i18n').i18next.getFixedT(this.lang, source);
  }

  private get __tLabelValue(): (s: string) => { label: string; value: string } {
    return this.__tSourceLabelValue(undefined);
  }

  private __tSourceLabelValue(
    source: undefined | string | string[]
  ): (s: string) => { label: string; value: string } {
    return s => {
      return {
        label: this.__tSource(source)(s).toString(),
        value: s,
      };
    };
  }

  private __handleCityChange(ev: CustomEvent) {
    const city = ev.detail?.explicitOriginalTarget?.value;
    this.edit({ city });
  }

  private __handleCountryChange(ev: CustomEvent) {
    const chosen = ev.detail.value;
    this.edit({ country: chosen, region: '' });
    customElements.get('foxy-i18n').i18next.loadNamespaces([`region-${chosen?.toLowerCase()}`]);
    this.__updateCountries();
  }

  private __handleIsLive(ev: CustomEvent) {
    this.edit({ is_live: ev.detail });
    this.__updateMode();
  }

  private __handleProviderChange(ev: CustomEvent) {
    if (ev.detail && ev.detail.value) {
      this.edit({ service_provider: ev.detail.value });
      this.__updateCountries();
    }
  }

  private __handleTypeChange(ev: CustomEvent) {
    this.edit({
      is_live: ev.detail.value == 'global' ? false : this.form.is_live,
      type: ev.detail.value,
    });
    this.__updateScope();
    this.__updateMode();
  }

  private __handleRegionChange(ev: CustomEvent) {
    this.edit({ region: ev.detail.value });
  }

  private __getRegions(): string[] {
    if (this.form && this.form.country) {
      const regions = (globalRegions as any)[this.form.country];
      if (regions && regions.length) {
        return regions;
      }
    }
    return [];
  }

  private __updateCountries(): void {
    const unionCountries = [
      'AT',
      'BE',
      'BG',
      'HR',
      'CY',
      'CZ',
      'DK',
      'EE',
      'FI',
      'FR',
      'DE',
      'GR',
      'HU',
      'IE',
      'IM',
      'IT',
      'LV',
      'LT',
      'LU',
      'MC',
      'MT',
      'NL',
      'PL',
      'PT',
      'RO',
      'SK',
      'SI',
      'ES',
      'SE',
      'GB',
    ];
    const liveRateSupportedCountries = ['US', 'CA'];
    const taxJarSupportedCountries = unionCountries
      .concat(liveRateSupportedCountries)
      .concat(['AU']);
    const chosen = this.form.country;
    if (chosen) {
      if (liveRateSupportedCountries.includes(chosen)) {
        this.__taxService!.send('CHOOSEEUA');
      } else if (unionCountries.includes(chosen)) {
        this.__taxService!.send('CHOOSEEUROPE');
      } else {
        this.__taxService!.send('CHOOSEANY');
      }
    }
  }

  private __updateMode() {
    if (this.form) {
      this.__taxService?.send(this.form.is_live ? 'LIVE' : 'RATE');
    }
  }

  private __updateScope(): void {
    if (this.form.type) {
      this.__taxService?.send('SET' + this.form.type.toUpperCase());
    }
  }
}
