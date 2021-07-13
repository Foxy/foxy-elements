import { CSSResultArray, TemplateResult, html } from 'lit-element';
import { Checkbox, I18N, PropertyTable } from '../../private';
import { Interpreter, createMachine, interpret } from 'xstate';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Themeable, ThemeableMixin } from '../../../mixins/themeable';
import { countries, countryDetails } from '../../../utils/countries';
import { ButtonElement } from '@vaadin/vaadin-button';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data } from './types';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { TranslatableMixin } from '../../../mixins/translatable';
import { globalRegions } from '../../../utils/regions';
import { ifDefined } from 'lit-html/directives/if-defined';
import memoize from 'lodash-es/memoize';
import { taxMachine } from './machine';
import { taxProviders } from './providers';

const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, 'tax-form')))
);

export class TaxForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-i18n': I18N,
      'foxy-internal-confirm-dialog': InternalConfirmDialog,
      'foxy-spinner': customElements.get('foxy-spinner'),
      'vaadin-text-field': TextFieldElement,
      'x-button': ButtonElement,
      'x-checkbox': Checkbox,
      'x-combo-box': ComboBoxElement,
      'x-property-table': PropertyTable,
    };
  }

  static get styles(): CSSResultArray {
    return Themeable.styles;
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name_required',
      ({ name: v }) => !v || v.length <= 30 || 'name_too_long',
      ({ type: v }) => !!v || 'type_required',
      ({ type: v }) => (v && TaxForm.__types.includes(v)) || 'type_unknown',
      ({ country: c, type: t }) => t != 'country' || !!c || 'country_required',
      ({ country: c, use_origin_rates: r }) => !r || !!c || 'country_required',
      ({ country: v }) => !v || !!v.match(/[A-Z]{2}/) || 'country_unknown',
      ({ region: v, type: t }) => t != 'region' || !!v || 'region_required',
      ({ region: v }) => !v || v.length <= 20 || 'region_unknown',
      ({ city: v }) => !v || v.length <= 20 || 'city_too_long',
      ({ city: c, type: t }) => t != 'local' || !!c || 'city_required',
      ({ service_provider: v }) => !v || taxProviders.includes(v) || 'service_provider_unknown',
      ({ is_live: l, service_provider: v }) => !l || !!v || 'service_provider_required',
      ({ rate: v }) => !v || v <= 100 || 'rate_unknown',
      ({ is_live: l, rate: v }) => !!l || !!v || 'rate_required',
    ];
  }

  private static __types = ['global', 'country', 'region', 'local', 'union'];

  private __namespaces: Array<string> = [];

  private __taxMachine = createMachine(taxMachine as any);

  private __taxService: Interpreter<any, any, any, { value: any; context: any }> | undefined;

  private __untrackTranslations?: () => void;

  private readonly __bindField = memoize((key: keyof Data) => {
    return (evt: CustomEvent) => {
      const target = evt.target as HTMLInputElement;
      this.edit({ [key]: target.value });
    };
  });

  private readonly __getValidator = memoize((prefix: string) => () => {
    return !this.errors.some(err => err.startsWith(prefix));
  });

  connectedCallback(): void {
    super.connectedCallback();
    this.__taxService = interpret(this.__taxMachine);
    this.__taxService.start();
    this.__untrackTranslations = customElements
      .get('foxy-i18n')
      .onTranslationChange(() => this.requestUpdate());
    this.__namespaces.push(this.ns, 'country');
    customElements.get('foxy-i18n').i18next.loadNamespaces(this.__namespaces);
  }

  requestUpdate(name?: string | number | symbol | undefined, oldValue?: unknown): Promise<unknown> {
    const r = super.requestUpdate(name, oldValue);
    this.updateFields();
    return r;
  }

  updateFields(): void {
    this.__updateScope();
    this.__updateCountries();
    this.__updateMode();
  }

  render(): TemplateResult {
    const ns = this.ns;
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
        <foxy-internal-confirm-dialog
          data-testid="confirm"
          message="delete_prompt"
          confirm="delete"
          cancel="cancel"
          header="delete"
          theme="primary error"
          lang=${this.lang}
          ns=${this.ns}
          id="confirm"
          @hide=${this.__handleConfirmHide}
        >
        </foxy-internal-confirm-dialog>
        <div class="flex flex-wrap flex-auto max-w-full gap-s">
          ${this.__textField('name', 'flex-1')}
          ${this.__comboBoxField('type', 'flex-1', TaxForm.__types.map(this.__tLabelValue))}
        </div>
        <div class="flex flex-wrap flex-auto max-w-full gap-s">
          ${this.__taxMachine.context.support.country
            ? html`
                <x-combo-box
                  data-testid="country"
                  class="flex-1"
                  label=${this.__tSource('country')('country')}
                  .items=${this.__getCountries()
                    .map(this.__tSourceLabelValue('country'))
                    .sort((a, b) => (a.label > b.label ? 1 : -1))}
                  value="${this.__getCountries().includes(this.form.country)
                    ? this.form.country
                    : ''}"
                  @value-changed="${this.__handleCountryChange}"
                  error-message=${this.__getErrorMessage('country')}
                ></x-combo-box>
              `
            : ''}
          ${this.__taxMachine.context.support.region
            ? html`
                <x-combo-box
                  data-testid="region"
                  class="flex-1"
                  label=${this.__tSource('region')('region')}
                  .items=${this.__getRegions()
                    .map(this.__tSourceLabelValue(`region-${this.form.country?.toLowerCase()}`))
                    .sort((a, b) => (a.label > b.label ? 1 : -1))}
                  value="${ifDefined(this.form.region)}"
                  @value-changed="${this.__handleRegionChange}"
                  error-message=${this.__getErrorMessage('region')}
                ></x-combo-box>
              `
            : ''}
          ${this.__taxMachine.context.support.city
            ? html`
                <vaadin-text-field
                  data-testid="city"
                  class="flex-1"
                  label=${this.__t('city').toString()}
                  value="${this.form.city ?? ''}"
                  @change=${this.__handleCityChange}
                  error-message=${this.__getErrorMessage('city')}
                >
                </vaadin-text-field>
              `
            : ''}
        </div>
        ${this.__taxMachine.context.support.automatic
          ? html`
              <x-checkbox
                data-testid="is_live"
                class="my-s"
                ?checked=${ifDefined(this.form.is_live)}
                @change=${this.__handleAutomatic}
                error-message=${this.__getErrorMessage('is_live')}
              >
                <foxy-i18n lang=${this.lang} ns=${ns} key="is_live"></foxy-i18n>
              </x-checkbox>
            `
          : ''}
        <div class="max-w-full border rounded-l border-contrast-10 p-s">
          ${this.__taxMachine.context.support.provider
            ? html` <x-combo-box
                class="flex-1"
                data-testid="service_provider"
                label=${this.__t('provider')}
                value="${ifDefined(this.form.service_provider)}"
                .items=${taxProviders
                  .filter(i => this.__taxMachine.context.support.providerOptions[i])
                  .map(this.__tLabelValue)}
                @value-changed=${this.__bindField('service_provider')}
                error-message="${this.__getErrorMessage('service_provider')}"
              >
              </x-combo-box>`
            : html`<vaadin-text-field
                data-testid="rate"
                label=${this.__t('taxRate').toString()}
                .value="${ifDefined(this.form.rate)}"
                @value-changed=${this.__bindField('rate')}
                error-message=${this.__getErrorMessage('rate')}
              >
              </vaadin-text-field>`}
          ${this.__taxMachine.context.support.exempt
            ? html`
                <x-checkbox
                  data-testid="exempt_all_customer_tax_ids"
                  class="my-s"
                  ?checked=${ifDefined(this.form.exempt_all_customer_tax_ids)}
                  .value="${ifDefined(this.form.exempt_all_customer_tax_ids)}"
                  @change=${this.__handleExemptChange}
                  error-message=${this.__getErrorMessage('exempt_all_customer_tax_ids')}
                >
                  <foxy-i18n
                    ns="${ns}"
                    lang="${this.lang}"
                    key="exempt_all_customer_tax_ids"
                  ></foxy-i18n>
                </x-checkbox>
              `
            : ''}
        </div>
        ${this.__taxMachine.context.support.origin
          ? html`
              <x-checkbox
                ?checked=${ifDefined(this.form.use_origin_rates)}
                @change=${this.__handleUseOriginRatesChange}
                error-message=${this.__getErrorMessage('use_origin_rates')}
                .value="${ifDefined(this.form.use_origin_rates)}"
                data-testid="use_origin_rates"
              >
                <foxy-i18n ns=${ns} lang=${this.lang} key="useOriginRates"></foxy-i18n>
              </x-checkbox>
            `
          : ''}
        ${this.__taxMachine.context.support.shipping
          ? html` <x-checkbox
              @change=${this.__handleApplyToShipping}
              class="my-s"
              ?checked=${ifDefined(this.form.apply_to_shipping)}
              error-message=${this.__getErrorMessage('apply_to_shipping')}
              data-testid="apply_to_shipping"
            >
              <foxy-i18n lang=${this.lang} ns=${ns} key="applyToShipping"></foxy-i18n>
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
        <div class="flex flex-wrap gap-x-s">
          ${this.href
            ? html`
                <x-button
                  aria-label="delete"
                  role="button"
                  class="flex-1"
                  theme=${this.in('idle') ? `primary ${this.href ? 'error' : 'success'}` : ''}
                  data-testid="action"
                  ?disabled="${!this.in('idle')}"
                  @click=${this.__handleDeleteClick}
                >
                  <foxy-i18n ns="${ns}" key="delete" lang="${this.lang}"></foxy-i18n>
                </x-button>
              `
            : ''}
          <x-button
            role="button"
            aria-label="${this.href ? 'save' : 'create'}"
            class="flex-1"
            theme="primary"
            data-testid='"action-save'
            ?disabled="${!this.in('idle')}"
            @click=${this.__handleActionClick}
          >
            <foxy-i18n ns="${ns}" key="${this.href ? 'save' : 'create'}" lang="${this.lang}">
            </foxy-i18n>
          </x-button>
        </div>
      `;
    }
  }

  private __textField(field: keyof Data, classString: string, label = undefined): TemplateResult {
    return html`
      <vaadin-text-field
        @change=${this.__bindField(field)}
        class="${classString}"
        data-testid="${field}"
        error-message=${this.__getErrorMessage(field)}
        label=${this.__t(label ? label! : field).toString()}
        value="${ifDefined(this.form[field])}"
      ></vaadin-text-field>
    `;
  }

  private __comboBoxField(
    field: keyof Data,
    classString: string,
    items: string[] | { label: string; value: string }[],
    label = undefined
  ): TemplateResult {
    return html` <x-combo-box
      .items=${items}
      @value-changed="${this.__bindField(field)}"
      class="flex-1"
      data-testid="${field}"
      error-message=${this.__getErrorMessage(field)}
      label=${this.__t(label ? label! : field).toString()}
      value="${ifDefined(this.form[field])}"
    >
      <style>
        [part='text-field'] {
          padding-top: 0;
        }
      </style>
    </x-combo-box>`;
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')) : '';
  }

  private get __t(): (s: string) => string {
    return s => this.__tSource(undefined)(s);
  }

  private __tSource(source: undefined | string | string[]): (s: string) => string {
    if (source === undefined) {
      source = this.ns;
    }
    return customElements.get('foxy-i18n').i18next.getFixedT(this.lang, source);
  }

  private get __tLabelValue(): (s: string) => { label: string; value: string } {
    return s => this.__tSourceLabelValue(undefined)(s);
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

  private __handleActionClick() {
    if (this.in('idle')) {
      this.submit();
    }
  }

  private __handleDeleteClick(evt: CustomEvent) {
    const confirm = this.renderRoot.querySelector('#confirm');
    (confirm as InternalConfirmDialog).show(evt.currentTarget as HTMLElement);
  }

  private __handleConfirmHide(evt: CustomEvent) {
    if (!evt.detail.cancelled) this.delete();
  }

  private __handleCityChange(ev: CustomEvent) {
    const city = ev.detail?.explicitOriginalTarget?.value;
    this.edit({ city });
  }

  private __handleCountryChange(ev: CustomEvent) {
    const chosen = ev.detail.value;
    this.edit({ country: chosen, region: '' });
    this.__namespaces.push(`region-${chosen?.toLowerCase()}`);
    customElements.get('foxy-i18n').i18next.loadNamespaces(this.__namespaces);
  }

  private __handleAutomatic(ev: CustomEvent) {
    this.edit({ is_live: ev.detail });
  }

  private __handleUseOriginRatesChange(ev: CustomEvent) {
    this.edit({ use_origin_rates: ev.detail });
  }

  private __handleApplyToShipping(ev: CustomEvent) {
    this.edit({ apply_to_shipping: ev.detail });
  }

  private __handleExemptChange(ev: CustomEvent) {
    this.edit({ exempt_all_customer_tax_ids: ev.detail });
  }

  private __handleRegionChange(ev: CustomEvent) {
    this.edit({ region: ev.detail.value });
  }

  private __getCountries(): string[] {
    if (
      this.form &&
      ['country', 'region', 'local'].includes(this.__taxMachine.context.value.scope)
    ) {
      return countries;
    } else if (this.form && this.__taxMachine.context.value.scope === 'union') {
      return countryDetails.filter(c => typeof c === 'object' && c.union).map(c => (c as any).code);
    }
    return [];
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
    const unionCountries = countryDetails
      .filter(i => typeof i != 'string' && i.union)
      .map(i => (i as any).code!);
    const usCa = ['US', 'CA'];
    const chosen = this.form.country;
    if (chosen) {
      if (usCa.includes(chosen)) {
        this.__taxService!.send('CHOOSEUSA');
      } else if (unionCountries.includes(chosen)) {
        this.__taxService!.send('CHOOSEEUROPE');
      } else if (chosen == 'AU') {
        this.__taxService!.send('CHOOSEAU');
      } else {
        this.__taxService!.send('CHOOSEANY');
      }
    }
  }

  private __updateMode() {
    if (this.form) {
      this.__taxService?.send(this.form.is_live ? 'LIVE' : 'RATE');
      if (this.form.service_provider) {
        this.__taxService?.send(`CHOOSE${this.form.service_provider.toUpperCase()}`);
      }
      this.__taxService?.send(
        this.form.use_origin_rates ? 'CHOOSEORIGINRATES' : 'CHOOSEREGULARRATES'
      );
    }
  }

  private __updateScope(): void {
    if (this.form.type) {
      this.__taxService?.send('SET' + this.form.type.toUpperCase());
    }
  }
}
