import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { UpdateEvent } from '../NucleonElement/UpdateEvent';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

type Embed = { 'fx:shipping_method': Resource<Rels.ShippingMethod> } | undefined;

const NS = 'store-shipping-method-form';
const Base = TranslatableMixin(InternalForm, NS);
const getKbSize = (value: string) => new Blob([value]).size / 1024;
const isURL = (value: string) => {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

/**
 * Form element for creating and editing store shipping methods (`fx:store_shipping_method`).
 *
 * @element foxy-store-shipping-method-form
 * @since 1.21.0
 */
export class StoreShippingMethodForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      shippingMethods: { attribute: 'shipping-methods' },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ shipping_method_uri: v }) => (v && isURL(v)) || 'shipping-method-uri:v8n_required',
      ({ accountid: v }) => !v || v.length <= 50 || 'accountid:v8n_too_long',
      ({ password: v }) => !v || v.length <= 50 || 'password:v8n_too_long',
      ({ meter_number: v }) => !v || v.length <= 50 || 'meter-number:v8n_too_long',
      ({ authentication_key: v }) => !v || v.length <= 50 || 'authentication-key:v8n_too_long',
      ({ custom_code: v }) => !v || getKbSize(v) <= 64 || 'custom-code:v8n_too_long',

      form => {
        if ((form._embedded as Embed)?.['fx:shipping_method']?.code === 'CUSTOM-ENDPOINT-POST') {
          return (form.accountid && isURL(form.accountid)) || 'endpoint:v8n_required';
        } else {
          return true;
        }
      },

      form => {
        const url = form.shipping_container_uri;
        const code = (form._embedded as Embed)?.['fx:shipping_method']?.code;
        const codes = ['USPS', 'FedEx', 'UPS'];

        if (code && codes.includes(code)) {
          return (url && isURL(url)) || 'shipping-container-uri:v8n_required';
        } else {
          return true;
        }
      },

      form => {
        const url = form.shipping_drop_type_uri;
        const code = (form._embedded as Embed)?.['fx:shipping_method']?.code;
        const codes = ['FedEx', 'UPS'];

        if (code && codes.includes(code)) {
          return (url && isURL(url)) || 'shipping-drop-type-uri:v8n_required';
        } else {
          return true;
        }
      },
    ];
  }

  /** URL of the `fx:shipping_methods` property helper. */
  shippingMethods: string | null = null;

  private readonly __shippingMethodLoaderId = 'shippingMethodLoader';

  private readonly __shippingMethodUriSetValue = (newValue: string) => {
    this.undo();
    this.edit({ shipping_method_uri: newValue });
  };

  private readonly __destinationsGetValue = () => {
    const value: string[] = [];
    if (this.form.use_for_domestic) value.push('domestic');
    if (this.form.use_for_international) value.push('international');
    return value;
  };

  private readonly __destinationsSetValue = (newValue: string[]) => {
    this.edit({
      use_for_domestic: newValue.includes('domestic'),
      use_for_international: newValue.includes('international'),
    });
  };

  private readonly __destinationsOptions = [
    { value: 'domestic', label: 'domestic' },
    { value: 'international', label: 'international' },
  ];

  get hiddenSelector(): BooleanSelector {
    const hasData = !!this.data;
    const code = this.__shippingMethod?.code;

    // prettier-ignore
    let hiddenControls = 'shipping-container-uri shipping-drop-type-uri destinations authentication-key meter-number accountid password endpoint custom-code';

    if (code) {
      const codeToHiddenControls: Record<string, string> = {
        // prettier-ignore
        'CUSTOM-ENDPOINT-POST': 'shipping-container-uri shipping-drop-type-uri destinations authentication-key meter-number accountid password custom-code',
        // prettier-ignore
        'CUSTOM-CODE': 'shipping-container-uri shipping-drop-type-uri destinations authentication-key meter-number accountid password endpoint',
        // prettier-ignore
        'CUSTOM': 'shipping-container-uri shipping-drop-type-uri authentication-key meter-number accountid password endpoint custom-code',
        // prettier-ignore
        'FedEx': 'endpoint custom-code',
        // prettier-ignore
        'USPS': 'authentication-key meter-number accountid password endpoint custom-code',
        // prettier-ignore
        'UPS': 'endpoint custom-code',
      };

      if (codeToHiddenControls[code]) hiddenControls = codeToHiddenControls[code];
    }

    if (!hasData || code?.startsWith('CUSTOM')) hiddenControls += ' services';
    if (hasData) hiddenControls = `shipping-method-uri ${hiddenControls}`;

    return new BooleanSelector(`${hiddenControls} ${super.hiddenSelector}`.trim());
  }

  get headerSubtitleOptions(): Record<string, unknown> {
    return { id: this.headerCopyIdValue };
  }

  get headerTitleOptions(): Record<string, unknown> {
    return { ...super.headerTitleOptions, provider: this.__shippingMethod?.name };
  }

  renderBody(): TemplateResult {
    const shippingMethod = this.__shippingMethod;

    return html`
      ${this.renderHeader()}

      <foxy-internal-resource-picker-control
        infer="shipping-method-uri"
        first=${ifDefined(this.shippingMethods ?? this.form._links?.['fx:shipping_methods'].href)}
        item="foxy-shipping-method-card"
        .setValue=${this.__shippingMethodUriSetValue}
      >
      </foxy-internal-resource-picker-control>

      <foxy-internal-resource-picker-control
        infer="shipping-container-uri"
        first=${ifDefined(shippingMethod?._links['fx:shipping_containers'].href)}
        item="foxy-shipping-container-card"
      >
      </foxy-internal-resource-picker-control>

      <foxy-internal-resource-picker-control
        infer="shipping-drop-type-uri"
        first=${ifDefined(shippingMethod?._links['fx:shipping_drop_types'].href)}
        item="foxy-shipping-drop-type-card"
      >
      </foxy-internal-resource-picker-control>

      <foxy-internal-checkbox-group-control
        infer="destinations"
        .getValue=${this.__destinationsGetValue}
        .setValue=${this.__destinationsSetValue}
        .options=${this.__destinationsOptions}
      >
      </foxy-internal-checkbox-group-control>

      <foxy-internal-text-control infer="authentication-key"></foxy-internal-text-control>
      <foxy-internal-text-control infer="meter-number"></foxy-internal-text-control>

      ${shippingMethod?.code === 'CUSTOM-ENDPOINT-POST'
        ? html`
            <foxy-internal-text-control infer="endpoint" property="accountid">
            </foxy-internal-text-control>
          `
        : html`<foxy-internal-text-control infer="accountid"></foxy-internal-text-control>`}

      <foxy-internal-password-control infer="password"></foxy-internal-password-control>
      <foxy-internal-source-control infer="custom-code"></foxy-internal-source-control>

      <foxy-internal-async-resource-link-list-control
        foreign-key-for-uri="shipping_service_uri"
        foreign-key-for-id="shipping_service_id"
        own-key-for-uri="shipping_method_uri"
        own-uri=${ifDefined(this.data?._links.self.href)}
        embed-key="fx:store_shipping_services"
        options-href=${ifDefined(shippingMethod?._links['fx:shipping_services'].href)}
        links-href=${ifDefined(this.data?._links['fx:store_shipping_services'].href)}
        infer="services"
        limit="200"
        item="foxy-shipping-service-card"
      >
      </foxy-internal-async-resource-link-list-control>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(this.form.shipping_method_uri || undefined)}
        id=${this.__shippingMethodLoaderId}
        @update=${(evt: UpdateEvent) => {
          const nucleon = evt.target as NucleonElement<Resource<Rels.ShippingMethod>>;
          const embed = nucleon.data;
          this.edit({ _embedded: embed ? { 'fx:shipping_method': embed } : {} });
        }}
      >
      </foxy-nucleon>

      ${super.renderBody()}
    `;
  }

  private get __shippingMethodLoader() {
    type Loader = NucleonElement<Resource<Rels.ShippingMethod>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__shippingMethodLoaderId}`);
  }

  private get __shippingMethod() {
    return (
      this.__shippingMethodLoader?.data ?? (this.form._embedded as Embed)?.['fx:shipping_method']
    );
  }
}
