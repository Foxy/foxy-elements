import { Checkbox, Dropdown, PropertyTable } from '../../private/index';
import { CheckboxChangeEvent, DropdownChangeEvent } from '../../private/events';
import { Data, Templates } from './types';
import { Nucleon, Resource } from '@foxy.io/sdk/core';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { IntegerFieldElement } from '@vaadin/vaadin-text-field/vaadin-integer-field';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/backend';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { interpret } from 'xstate';

// prettier-ignore
const defaultLiveRateCountries: (string | undefined)[] = ['US', 'CA', 'AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'GR', 'HR', 'HU', 'IE', 'IM', 'IT', 'LT', 'LU', 'LV', 'MC', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
const taxJarLiveRateCountries = [...defaultLiveRateCountries, 'AU'];

const NS = 'tax-form';
const Base = ConfigurableMixin(
  ThemeableMixin(ScopedElementsMixin(TranslatableMixin(NucleonElement, NS)))
);

/**
 * Form element for creating or editing taxes (`fx:tax`).
 *
 * @slot name:before
 * @slot name:after
 *
 * @slot type:before
 * @slot type:after
 *
 * @slot country:before
 * @slot country:after
 *
 * @slot region:before
 * @slot region:after
 *
 * @slot city:before
 * @slot city:after
 *
 * @slot provider:before
 * @slot provider:after
 *
 * @slot rate:before
 * @slot rate:after
 *
 * @slot apply-to-shipping:before
 * @slot apply-to-shipping:after
 *
 * @slot use-origin-rates:before
 * @slot use-origin-rates:after
 *
 * @slot exempt-all-customer-tax-ids:before
 * @slot exempt-all-customer-tax-ids:after
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
 * @element foxy-tax-form
 * @since 1.13.0
 */
export class TaxForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-combo-box': customElements.get('vaadin-combo-box'),
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-internal-confirm-dialog': customElements.get('foxy-internal-confirm-dialog'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-property-table': PropertyTable,
      'x-checkbox': Checkbox,
      'x-dropdown': Dropdown,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      countries: { type: String, noAccessor: true },
      regions: { type: String, noAccessor: true },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => !!v || 'name_required',
      ({ name: v }) => !v || v.length <= 30 || 'name_too_long',
      ({ country: c, type: t }) => t !== 'country' || !!c || 'country_required',
      ({ country: c, type: t }) => t !== 'region' || !!c || 'country_required',
      ({ country: c, use_origin_rates: r }) => !r || !!c || 'country_required',
      ({ country: v }) => !v || !!v.match(/[A-Z]{2}/) || 'country_invalid',
      ({ region: v, type: t }) => t != 'region' || !!v || 'region_required',
      ({ region: v }) => !v || v.length <= 20 || 'region_too_long',
      ({ city: v }) => !v || v.length <= 50 || 'city_too_long',
      ({ city: c, type: t }) => t != 'local' || !!c || 'city_required',
      ({ rate: v }) => !v || v <= 100 || 'rate_invalid',
    ];
  }

  templates: Templates = {};

  private __previousCountry: string | undefined = undefined;

  private __countries = '';

  private __regions = '';

  private __countriesService = interpret(
    Nucleon.machine.withConfig({
      services: {
        sendGet: async () => {
          const response = await new TaxForm.API(this).fetch(this.countries);
          if (!response.ok) throw new Error(await response.text());
          return await response.json();
        },
      },
    })
  );

  private __regionsService = interpret(
    Nucleon.machine.withConfig({
      services: {
        sendGet: async () => {
          const url = new URL(this.regions);
          url.searchParams.set('country_code', this.form.country ?? 'US');
          const response = await new TaxForm.API(this).fetch(url.toString());
          if (!response.ok) throw new Error(await response.text());
          return await response.json();
        },
      },
    })
  );

  /** URI of the `fx:countries` hAPI resource. */
  get countries(): string {
    return this.__countries;
  }

  set countries(value: string) {
    this.__countries = value;

    if (value) {
      this.__countriesService.send({ type: 'FETCH' });
    } else {
      this.__countriesService.send({ type: 'SET_DATA', data: null });
    }
  }

  /** URI of the `fx:regions` hAPI resource. */
  get regions(): string {
    return this.__regions;
  }

  set regions(value: string) {
    this.__regions = value;

    if (value) {
      this.__regionsService.send({ type: 'FETCH' });
    } else {
      this.__regionsService.send({ type: 'SET_DATA', data: null });
    }
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.__countriesService.onTransition(({ changed }) => changed && this.requestUpdate());
    this.__countriesService.onChange(() => this.requestUpdate());
    this.__countriesService.start();

    this.__regionsService.onTransition(({ changed }) => changed && this.requestUpdate());
    this.__regionsService.onChange(() => this.requestUpdate());
    this.__regionsService.start();
  }

  render(): TemplateResult {
    return html`
      <div class="relative space-y-m">
        ${this.__isNameHidden ? null : this.__renderName()}
        ${this.__isTypeHidden ? null : this.__renderType()}
        ${this.__isCountryHidden ? null : this.__renderCountry()}
        ${this.__isRegionHidden ? null : this.__renderRegion()}
        ${this.__isCityHidden ? null : this.__renderCity()}
        ${this.__isProviderHidden ? null : this.__renderProvider()}
        ${this.__isRateHidden ? null : this.__renderRate()}
        ${this.__isApplyToShippingHidden ? null : this.__renderApplyToShipping()}
        ${this.__isUseOriginRatesHidden ? null : this.__renderUseOriginRates()}
        ${this.__isExemptAllCustomerTaxIdsHidden ? null : this.__renderExemptAllCustomerTaxIds()}
        ${this.__isTimestampsHidden ? null : this.__renderTimestamps()}
        ${this.__isCreateHidden ? null : this.__renderCreate()}
        ${this.__isDeleteHidden ? null : this.__renderDelete()}

        <div
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !this.in('busy') && !this.in('fail'),
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="m-auto p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty'}
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);

    if (this.form.country !== this.__previousCountry) {
      this.__previousCountry = this.form.country;
      this.__regionsService.send({ type: 'FETCH' });
    }

    // vaadin's combo box doesn't seem to validate on its own
    this.renderRoot.querySelectorAll('vaadin-combo-box').forEach(e => e.validate());
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.__countriesService.stop();
    this.__regionsService.stop();
  }

  private get __isNameHidden(): boolean {
    return this.hiddenSelector.matches('name', true);
  }

  private get __isTypeHidden(): boolean {
    return this.hiddenSelector.matches('type', true);
  }

  private get __isCountryHidden(): boolean {
    if (this.hiddenSelector.matches('country', true)) return true;
    if (this.form.type === 'union') return !this.form.use_origin_rates;
    return !(['country', 'region', 'local'] as unknown[]).includes(this.form.type);
  }

  private get __isRegionHidden(): boolean {
    if (this.hiddenSelector.matches('region', true)) return true;
    return this.form.type !== 'local' && this.form.type !== 'region';
  }

  private get __isCityHidden(): boolean {
    if (this.hiddenSelector.matches('city', true)) return true;
    return this.form.type !== 'local';
  }

  private get __isProviderHidden(): boolean {
    if (this.hiddenSelector.matches('provider', true)) return true;
    return !this.form.type || this.form.type === 'global' || this.form.type === 'local';
  }

  private get __isRateHidden(): boolean {
    if (this.hiddenSelector.matches('rate', true)) return true;
    return !this.form.type || this.form.is_live === true;
  }

  private get __isApplyToShippingHidden(): boolean {
    if (this.hiddenSelector.matches('apply-to-shipping', true)) return true;
    if (this.form.type === undefined) return true;
    return !!this.form.is_live && defaultLiveRateCountries.includes(this.form.country);
  }

  private get __isUseOriginRatesHidden(): boolean {
    if (this.hiddenSelector.matches('use-origin-rates', true)) return true;
    return this.form.type !== 'union' || !this.form.is_live || !!this.form.service_provider;
  }

  private get __isExemptAllCustomerTaxIdsHidden(): boolean {
    if (this.hiddenSelector.matches('exempt-all-customer-tax-ids', true)) return true;
    const provider = this.form.service_provider as string | undefined;
    return provider === undefined || provider === 'onesource' || provider === 'avalara';
  }

  private get __isTimestampsHidden(): boolean {
    if (this.hiddenSelector.matches('timestamps', true)) return true;
    return !this.data;
  }

  private get __isCreateHidden(): boolean {
    if (this.hiddenSelector.matches('create', true)) return true;
    return !!this.data;
  }

  private get __isDeleteHidden(): boolean {
    if (this.hiddenSelector.matches('delete', true)) return true;
    return !this.data;
  }

  private __getErrorMessage(prefix: string) {
    const error = this.errors.find(err => err.startsWith(prefix));
    return error ? this.t(error.replace(prefix, 'v8n')).toString() : '';
  }

  private __getValidator(prefix: string) {
    return () => !this.errors.some(err => err.startsWith(prefix));
  }

  private __renderName(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('name:before')}

        <vaadin-text-field
          class="w-full"
          label=${this.t('name')}
          value=${ifDefined(this.form.name)}
          .checkValidity=${this.__getValidator('name')}
          .errorMessage=${this.__getErrorMessage('name')}
          ?disabled=${this.in('busy') || this.disabledSelector.matches('name', true)}
          ?readonly=${this.readonlySelector.matches('name', true)}
          required
          @input=${(evt: CustomEvent) => {
            const newName = (evt.currentTarget as TextFieldElement).value;
            this.edit({ name: newName });
          }}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot('name:after')}
      </div>
    `;
  }

  private __renderType(): TemplateResult {
    if (!this.form.type) this.edit({ type: 'global' });

    return html`
      <div>
        ${this.renderTemplateOrSlot('type:before')}

        <x-dropdown
          label=${this.t('type')}
          value=${ifDefined(this.form.type)}
          class="w-full"
          .items=${['global', 'union', 'country', 'region', 'local']}
          .getText=${(value: string) => this.t(`tax_${value}`)}
          ?disabled=${this.in('busy') || this.disabledSelector.matches('type', true)}
          ?readonly=${this.readonlySelector.matches('type', true)}
          @change=${(evt: DropdownChangeEvent) => {
            this.edit({
              type: evt.detail as Data['type'],
              country: '',
              region: '',
              city: '',
              service_provider: '',
              apply_to_shipping: false,
              use_origin_rates: false,
              exempt_all_customer_tax_ids: false,
              is_live: false,
              rate: 0,
            });
          }}
        >
        </x-dropdown>

        ${this.renderTemplateOrSlot('type:after')}
      </div>
    `;
  }

  private __renderCountry(): TemplateResult {
    const isLoadingItems = this.__countriesService.state.matches('busy');
    const isLoadingData = this.in('busy');
    const isLoading = isLoadingItems || isLoadingData;
    const json = this.__countriesService.state.context.data as Resource<Rels.Countries> | null;
    const items = Object.values(json?.values ?? {});

    return html`
      <div>
        ${this.renderTemplateOrSlot('country:before')}

        <vaadin-combo-box
          item-value-path="cc2"
          item-label-path="default"
          item-id-path="cc2"
          label="${this.t('country')}${isLoadingItems ? ` • ${this.t('loading_busy')}` : ''}"
          value=${ifDefined(isLoadingItems ? undefined : this.form.country)}
          class="w-full"
          .checkValidity=${this.__getValidator('country')}
          .errorMessage=${this.__getErrorMessage('country')}
          .items=${items}
          ?allow-custom-value=${items.length === 0}
          ?disabled=${isLoading || this.disabledSelector.matches('country', true)}
          ?readonly=${this.readonlySelector.matches('country', true)}
          required
          @change=${(evt: CustomEvent) => {
            this.edit({
              country: (evt.currentTarget as ComboBoxElement).value,
              region: '',
              city: '',
              is_live: false,
              service_provider: '',
            });

            if (this.__isApplyToShippingHidden) this.edit({ apply_to_shipping: false });
            this.__regionsService.send({ type: 'FETCH' });
          }}
        >
        </vaadin-combo-box>

        ${this.renderTemplateOrSlot('country:after')}
      </div>
    `;
  }

  private __renderRegion(): TemplateResult {
    const isLoadingItems = this.__regionsService.state.matches('busy');
    const isLoadingData = this.in('busy');
    const isLoading = isLoadingItems || isLoadingData;
    const json = this.__regionsService.state.context.data as Resource<Rels.Regions> | null;
    const items = Object.values(json?.values ?? {});

    return html`
      <div>
        ${this.renderTemplateOrSlot('region:before')}

        <vaadin-combo-box
          item-value-path="code"
          item-label-path="default"
          item-id-path="code"
          label="${this.t('region')}${isLoadingItems ? ` • ${this.t('loading_busy')}` : ''}"
          value=${ifDefined(isLoadingItems ? undefined : this.form.region)}
          class="w-full"
          .checkValidity=${this.__getValidator('region')}
          .errorMessage=${this.__getErrorMessage('region')}
          .items=${items}
          ?allow-custom-value=${items.length === 0}
          ?disabled=${isLoading || this.disabledSelector.matches('region', true)}
          ?readonly=${this.readonlySelector.matches('region', true)}
          required
          @change=${(evt: CustomEvent) => {
            const newRegion = (evt.currentTarget as ComboBoxElement).value;
            this.edit({ region: newRegion, city: '' });
          }}
        >
        </vaadin-combo-box>

        ${this.renderTemplateOrSlot('region:after')}
      </div>
    `;
  }

  private __renderCity(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('city:before')}

        <vaadin-text-field
          class="w-full"
          label=${this.t('city')}
          value=${ifDefined(this.form.city)}
          .checkValidity=${this.__getValidator('city')}
          .errorMessage=${this.__getErrorMessage('city')}
          ?disabled=${this.in('busy') || this.disabledSelector.matches('city', true)}
          ?readonly=${this.readonlySelector.matches('city', true)}
          required
          @input=${(evt: CustomEvent) => {
            const newCity = (evt.currentTarget as TextFieldElement).value;
            this.edit({ city: newCity });
          }}
        >
        </vaadin-text-field>

        ${this.renderTemplateOrSlot('city:after')}
      </div>
    `;
  }

  private __renderProvider(): TemplateResult {
    const items = [
      { label: this.t('tax_rate_provider_none'), value: 'none' },
      { label: 'Avalara AvaTax 15', value: 'avalara' },
      { label: 'Thomson Reuters ONESOURCE', value: 'onesource' },
    ];

    if (this.form.type === 'union' || defaultLiveRateCountries.includes(this.form.country)) {
      items.push({ label: this.t('tax_rate_provider_default'), value: 'default' });
    }

    if (taxJarLiveRateCountries.includes(this.form.country)) {
      items.push({ label: 'TaxJar', value: 'taxjar' });
    }

    return html`
      <div>
        ${this.renderTemplateOrSlot('provider:before')}

        <x-dropdown
          label=${this.t('tax_rate_provider')}
          value=${this.form.service_provider || (this.form.is_live ? 'default' : 'none')}
          class="w-full"
          .items=${items.map(item => item.value)}
          .getText=${(value: string) => items.find(item => item.value === value)?.label}
          ?disabled=${this.in('busy') || this.disabledSelector.matches('provider', true)}
          ?readonly=${this.readonlySelector.matches('provider', true)}
          @change=${(evt: DropdownChangeEvent) => {
            const newValue = evt.detail as string;
            const newProvider = ['none', 'default'].includes(newValue) ? '' : newValue;

            this.edit({
              service_provider: newProvider as Data['service_provider'],
              is_live: newValue !== 'none',
            });

            if (this.__isExemptAllCustomerTaxIdsHidden) {
              this.edit({ exempt_all_customer_tax_ids: false });
            }

            if (this.__isApplyToShippingHidden) this.edit({ apply_to_shipping: false });
            if (this.__isUseOriginRatesHidden) this.edit({ use_origin_rates: false });
          }}
        >
        </x-dropdown>

        ${this.renderTemplateOrSlot('provider:after')}
      </div>
    `;
  }

  private __renderRate(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('rate:before')}

        <vaadin-integer-field
          class="w-full"
          label=${this.t('tax_rate')}
          value=${ifDefined(this.form.rate)}
          min="0"
          prevent-invalid-input
          has-controls
          .checkValidity=${this.__getValidator('rate')}
          .errorMessage=${this.__getErrorMessage('rate')}
          ?disabled=${this.in('busy') || this.disabledSelector.matches('rate', true)}
          ?readonly=${this.readonlySelector.matches('rate', true)}
          required
          @change=${(evt: CustomEvent) => {
            const newRate = parseInt((evt.currentTarget as IntegerFieldElement).value);
            this.edit({ rate: newRate });
          }}
        >
        </vaadin-integer-field>

        ${this.renderTemplateOrSlot('rate:after')}
      </div>
    `;
  }

  private __renderApplyToShipping(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('apply-to-shipping:before')}

        <x-checkbox
          class="leading-s"
          ?disabled=${this.disabledSelector.matches('apply-to-shipping', true)}
          ?readonly=${this.readonlySelector.matches('apply-to-shipping', true)}
          ?checked=${!!this.form.apply_to_shipping}
          @change=${(evt: CheckboxChangeEvent) => this.edit({ apply_to_shipping: evt.detail })}
        >
          <foxy-i18n
            class="block text-m text-body"
            lang=${this.lang}
            key="tax_apply_to_shipping"
            ns=${this.ns}
          >
          </foxy-i18n>

          <foxy-i18n
            class="block text-s text-secondary"
            lang=${this.lang}
            key="tax_apply_to_shipping_explainer"
            ns=${this.ns}
          >
          </foxy-i18n>
        </x-checkbox>

        ${this.renderTemplateOrSlot('apply-to-shipping:after')}
      </div>
    `;
  }

  private __renderUseOriginRates(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('use-origin-rates:before')}

        <x-checkbox
          class="leading-s"
          ?disabled=${this.disabledSelector.matches('use-origin-rates', true)}
          ?readonly=${this.readonlySelector.matches('use-origin-rates', true)}
          ?checked=${!!this.form.use_origin_rates}
          @change=${(evt: CheckboxChangeEvent) => this.edit({ use_origin_rates: evt.detail })}
        >
          <foxy-i18n
            class="block text-m text-body"
            lang=${this.lang}
            key="tax_use_origin_rates"
            ns=${this.ns}
          >
          </foxy-i18n>

          <foxy-i18n
            class="block text-s text-secondary"
            lang=${this.lang}
            key="tax_use_origin_rates_explainer"
            ns=${this.ns}
          >
          </foxy-i18n>
        </x-checkbox>

        ${this.renderTemplateOrSlot('use-origin-rates:after')}
      </div>
    `;
  }

  private __renderExemptAllCustomerTaxIds(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('exempt-all-customer-tax-ids:before')}

        <x-checkbox
          class="leading-s"
          ?disabled=${this.disabledSelector.matches('exempt-all-customer-tax-ids', true)}
          ?readonly=${this.readonlySelector.matches('exempt-all-customer-tax-ids', true)}
          ?checked=${!!this.form.exempt_all_customer_tax_ids}
          @change=${(evt: CheckboxChangeEvent) => {
            this.edit({ exempt_all_customer_tax_ids: evt.detail });
          }}
        >
          <foxy-i18n
            class="block text-m text-body"
            lang=${this.lang}
            key="tax_exempt_all_customer_tax_ids"
            ns=${this.ns}
          >
          </foxy-i18n>

          <foxy-i18n
            class="block text-s text-secondary"
            lang=${this.lang}
            key="tax_exempt_all_customer_tax_ids_explainer"
            ns=${this.ns}
          >
          </foxy-i18n>
        </x-checkbox>

        ${this.renderTemplateOrSlot('exempt-all-customer-tax-ids:after')}
      </div>
    `;
  }

  private __renderTimestamps(): TemplateResult {
    return html`
      <div>
        ${this.renderTemplateOrSlot('timestamps:before')}

        <x-property-table
          .items=${(['date_modified', 'date_created'] as const).map(field => ({
            name: this.t(field),
            value: this.data ? this.t('date', { value: new Date(this.data[field]) }) : '',
          }))}
        >
        </x-property-table>

        ${this.renderTemplateOrSlot('timestamps:after')}
      </div>
    `;
  }

  private __renderCreate(): TemplateResult {
    const isCleanTemplateInvalid = this.in({ idle: { template: { clean: 'invalid' } } });
    const isDirtyTemplateInvalid = this.in({ idle: { template: { dirty: 'invalid' } } });
    const isCleanSnapshotInvalid = this.in({ idle: { snapshot: { clean: 'invalid' } } });
    const isDirtySnapshotInvalid = this.in({ idle: { snapshot: { dirty: 'invalid' } } });
    const isTemplateInvalid = isCleanTemplateInvalid || isDirtyTemplateInvalid;
    const isSnaphotInvalid = isCleanSnapshotInvalid || isDirtySnapshotInvalid;
    const isInvalid = isTemplateInvalid || isSnaphotInvalid;
    const isBusy = this.in('busy');

    return html`
      <div>
        ${this.renderTemplateOrSlot('create:before')}

        <vaadin-button
          class="w-full"
          theme="primary success"
          ?disabled=${isBusy || isInvalid || this.disabledSelector.matches('create', true)}
          @click=${this.submit}
        >
          <foxy-i18n ns=${this.ns} key="create" lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('create:after')}
      </div>
    `;
  }

  private __renderDelete(): TemplateResult {
    return html`
      <div>
        <foxy-internal-confirm-dialog
          message="delete_prompt"
          confirm="delete"
          cancel="cancel"
          header="delete"
          theme="primary error"
          lang=${this.lang}
          ns=${this.ns}
          id="confirm"
          @hide=${(evt: DialogHideEvent) => !evt.detail.cancelled && this.delete()}
        >
        </foxy-internal-confirm-dialog>

        ${this.renderTemplateOrSlot('delete:before')}

        <vaadin-button
          theme="primary error"
          class="w-full"
          ?disabled=${this.in('busy') || this.disabledSelector.matches('delete', true)}
          @click=${(evt: CustomEvent) => {
            const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;
            confirm.show(evt.currentTarget as ButtonElement);
          }}
        >
          <foxy-i18n ns=${this.ns} key="delete" lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        ${this.renderTemplateOrSlot('delete:after')}
      </div>
    `;
  }
}
