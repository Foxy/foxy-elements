import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { AddressEntry, ZoomedCustomer } from './types';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { CartForm } from '../../CartForm';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { ResponsiveMixin } from '../../../../../mixins/responsive';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../../../utils/class-map';
import { style } from './style';
import { html } from 'lit-html';

export class InternalCartFormAddressSummaryItem extends ResponsiveMixin(InternalEditableControl) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      countries: {},
      customer: { type: Object },
      regions: {},
      type: {},
    };
  }

  static get styles(): CSSResultArray {
    return [...super.styles, style];
  }

  /** URL of the `fx:countries` property helper. */
  countries: string | null = null;

  /** Customer resource with billing and shipping address zoomed. */
  customer: ZoomedCustomer | null = null;

  /** URL of the `fx:regions` property helper. */
  regions: string | null = null;

  /** Type of the address. Billing by default. */
  type: 'billing' | 'shipping' | null = null;

  get disabledSelector(): BooleanSelector {
    const alwaysMatch = [super.disabledSelector.toString()];
    if (!this.__regionsLoader?.data) alwaysMatch.unshift('address:state');
    return new BooleanSelector(alwaysMatch.join(' ').toString());
  }

  renderControl(): TemplateResult {
    const regionOptions = this.__regionOptions;
    const addressType = this.type ?? 'billing';
    const address = this.__mergedAddress;

    return html`
      <div class="flex flex-col gap-m sm-flex-row items-start leading-xs">
        <div class="flex-1">
          <p class="text-m text-body">${this.label}</p>
          <p class="text-xs text-secondary">${this.helperText}</p>
          <p class="text-xs text-error" ?hidden=${this.disabled || this.readonly}>
            ${this._errorMessage}
          </p>
        </div>

        <button
          aria-label=${this.t('edit')}
          class=${classMap({
            'text-left sm-text-right transition-colors transition-opacity': true,
            'text-body cursor-pointer hover-opacity-80': !this.disabled && !this.readonly,
            'text-secondary': this.readonly,
            'text-disabled': this.disabled,
            'font-medium': !this.readonly,
          })}
          ?disabled=${this.disabled || this.readonly}
          @click=${() => this.__dialog?.showModal()}
        >
          ${this.__isAddressEmpty
            ? html`<foxy-i18n infer="" key="not_set"></foxy-i18n>`
            : html`
                <div>
                  ${this.__renderAddressPart(address.first_name)}
                  ${this.__renderAddressPart(address.last_name)}
                </div>
                <div>${this.__renderAddressPart(address.company)}</div>
                <div>${this.__renderAddressPart(address.phone)}</div>
                <div>
                  ${this.__renderAddressPart(address.address1)}
                  ${this.__renderAddressPart(address.address2)}
                  ${this.__renderAddressPart(address.city)}
                  ${this.__renderAddressPart(address.state)}
                  ${this.__renderAddressPart(address.postal_code)}
                  ${this.__renderAddressPart(address.country)}
                </div>
              `}
        </button>
      </div>

      <dialog id="dialog" class="p-m bg-base shadow-xxl space-y-m">
        <h2 class="text-xl font-medium">
          <foxy-i18n infer="" key="label"></foxy-i18n>
        </h2>

        <foxy-internal-summary-control infer="name">
          ${this.__renderTextField(address.first_name)} ${this.__renderTextField(address.last_name)}
        </foxy-internal-summary-control>

        <foxy-internal-summary-control infer="address">
          ${this.__renderTextField(address.address1)} ${this.__renderTextField(address.address2)}
          ${this.__renderTextField(address.city)}

          <foxy-internal-select-control
            placeholder=${ifDefined(this.__getPlaceholder(address.country))}
            property="${addressType}_country"
            layout="summary-item"
            infer="country"
            .options=${this.__countryOptions}
          >
          </foxy-internal-select-control>

          ${regionOptions.length > 0
            ? html`
                <foxy-internal-select-control
                  placeholder=${ifDefined(this.__getPlaceholder(address.state))}
                  property="${addressType}_state"
                  layout="summary-item"
                  infer="state"
                  .options=${regionOptions}
                >
                </foxy-internal-select-control>
              `
            : this.__renderTextField(address.state)}
          ${this.__renderTextField(address.postal_code)}
        </foxy-internal-summary-control>

        <foxy-internal-summary-control infer="extra">
          ${this.__renderTextField(address.company)} ${this.__renderTextField(address.phone)}
        </foxy-internal-summary-control>

        <p class="text-xs text-secondary">
          <foxy-i18n infer="" key="form_helper_text"></foxy-i18n>
        </p>

        <div class="flex justify-between gap-m">
          <vaadin-button
            theme="error"
            ?disabled=${this.disabled}
            ?hidden=${this.readonly}
            @click=${() => {
              this.nucleon?.edit({
                [`${addressType}_first_name`]: null,
                [`${addressType}_last_name`]: null,
                [`${addressType}_company`]: null,
                [`${addressType}_address1`]: null,
                [`${addressType}_address2`]: null,
                [`${addressType}_city`]: null,
                [`${addressType}_state`]: null,
                [`${addressType}_postal_code`]: null,
                [`${addressType}_country`]: null,
                [`${addressType}_phone`]: null,
              });
            }}
          >
            <foxy-i18n infer="" key="reset"></foxy-i18n>
          </vaadin-button>

          <vaadin-button
            theme="primary"
            ?disabled=${this.disabled}
            @click=${() => this.__dialog?.close()}
          >
            <foxy-i18n infer="" key="done"></foxy-i18n>
          </vaadin-button>
        </div>
      </dialog>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.countries ?? undefined)}
        id="countriesLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.__regionsUrl)}
        id="regionsLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private __renderAddressPart(entry: AddressEntry) {
    const text = this.__getDisplayText(entry);

    return html`
      <span
        class=${classMap({
          'text-success bg-success-10': entry.modified && !this.disabled,
          'bg-contrast-5': entry.modified && this.disabled,
          'inline-block': !!text,
          'rounded-s': true,
          'hidden': !text,
        })}
      >
        ${text}
      </span>
    `;
  }

  private __renderTextField(entry: AddressEntry) {
    return html`
      <foxy-internal-text-control
        placeholder=${ifDefined(this.__getPlaceholder(entry))}
        property="${this.type ?? 'billing'}_${entry.field}"
        layout="summary-item"
        infer=${entry.field.replace(/_/g, '-').replace('1', '-one').replace('2', '-two')}
        @clear=${() => this.nucleon?.edit({ [`${this.type ?? 'billing'}_${entry.field}`]: null })}
      >
      </foxy-internal-text-control>
    `;
  }

  private __getDisplayText(entry: AddressEntry) {
    return entry.value || (entry.modified ? '--' : '');
  }

  private __getPlaceholder(entry: AddressEntry) {
    return entry.modified ? this.t('empty_modified_placeholder') : entry.originalValue || void 0;
  }

  private get __countriesLoader() {
    type Loader = NucleonElement<Resource<Rels.Countries>>;
    return this.renderRoot.querySelector<Loader>('#countriesLoader');
  }

  private get __countryOptions() {
    return Object.values(this.__countriesLoader?.data?.values ?? {}).map(v => ({
      rawLabel: v.default,
      value: v.cc2,
    }));
  }

  private get __isAddressEmpty() {
    return Object.values(this.__mergedAddress).every(entry => this.__getDisplayText(entry) === '');
  }

  private get __regionOptions() {
    return Object.values(this.__regionsLoader?.data?.values ?? {}).map(v => ({
      rawLabel: v.default,
      value: v.code,
    }));
  }

  private get __regionsLoader() {
    type Loader = NucleonElement<Resource<Rels.Regions>>;
    return this.renderRoot.querySelector<Loader>('#regionsLoader');
  }

  private get __mergedAddress() {
    type EmbedKey = 'fx:default_billing_address' | 'fx:default_shipping_address';

    const cart = (this.nucleon as CartForm | null)?.form;
    const type = this.type === 'shipping' ? 'shipping' : 'billing';
    const defaults = this.customer?._embedded[`fx:default_${type}_address` as EmbedKey] ?? {};
    const addressFields = [
      'first_name',
      'last_name',
      'company',
      'address1',
      'address2',
      'city',
      'state',
      'postal_code',
      'country',
      'phone',
    ];

    const address = addressFields.reduce<Record<string, AddressEntry>>((acc, field) => {
      const cartKey = `${type}_${field}` as keyof typeof cart;
      const cartValue = cart?.[cartKey];
      const defaultKey = (field === 'state' ? 'region' : field) as keyof typeof defaults;
      const defaultValue = defaults?.[defaultKey];

      acc[field] = {
        originalValue: String(defaultValue ?? ''),
        modified: cartValue !== null,
        value: String(cartValue ?? defaultValue ?? ''),
        field,
      };

      return acc;
    }, {});

    return address;
  }

  private get __regionsUrl() {
    try {
      const regionsURL = new URL(this.regions ?? '');
      const country = this.__mergedAddress.country.value;
      if (country) regionsURL.searchParams.set('country_code', country);
      return regionsURL.toString();
    } catch {
      // ignore
    }
  }

  private get __dialog() {
    return this.renderRoot.querySelector<HTMLDialogElement>('#dialog');
  }
}
