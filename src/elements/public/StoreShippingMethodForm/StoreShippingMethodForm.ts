import type { InternalAsyncComboBoxControl } from '../../internal/InternalAsyncComboBoxControl/InternalAsyncComboBoxControl';
import type { Templates, Data } from './types';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

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
 * @slot shipping-method-uri:before
 * @slot shipping-method-uri:after
 *
 * @slot shipping-container-uri:before
 * @slot shipping-container-uri:after
 *
 * @slot shipping-drop-type-uri:before
 * @slot shipping-drop-type-uri:after
 *
 * @slot destinations:before
 * @slot destinations:after
 *
 * @slot authentication-key:before
 * @slot authentication-key:after
 *
 * @slot meter-number:before
 * @slot meter-number:after
 *
 * @slot endpoint:before
 * @slot endpoint:after
 *
 * @slot accountid:before
 * @slot accountid:after
 *
 * @slot password:before
 * @slot password:after
 *
 * @slot custom-code:before
 * @slot custom-code:after
 *
 * @slot services:before
 * @slot services:after
 *
 * @slot timestamps:before
 * @slot timestamps:after
 *
 * @slot create:before
 * @slot create:after
 *
 * @slot delete:before
 * @slot delete:after
 *
 * @element foxy-store-shipping-method-form
 * @since 1.21.0
 */
export class StoreShippingMethodForm extends Base<Data> {
  static get properties(): typeof Base['properties'] {
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
        if (form._embedded?.['fx:shipping_method']?.code === 'CUSTOM-ENDPOINT-POST') {
          return (form.accountid && isURL(form.accountid)) || 'endpoint:v8n_required';
        } else {
          return true;
        }
      },

      form => {
        const url = form.shipping_container_uri;
        const code = form._embedded?.['fx:shipping_method']?.code;
        const codes = ['USPS', 'FedEx', 'UPS'];

        if (code && codes.includes(code)) {
          return (url && isURL(url)) || 'shipping-container-uri:v8n_required';
        } else {
          return true;
        }
      },

      form => {
        const url = form.shipping_drop_type_uri;
        const code = form._embedded?.['fx:shipping_method']?.code;
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

  /** Template render functions mapped to their name. */
  templates: Templates = {};

  private __destinations = [
    { value: 'domestic', label: 'domestic' },
    { value: 'international', label: 'international' },
  ];

  private __getDestinations = () => {
    const value: string[] = [];
    if (this.form.use_for_domestic) value.push('domestic');
    if (this.form.use_for_international) value.push('international');
    return value;
  };

  private __setDestinations = (newValue: string[]) => {
    this.edit({
      use_for_domestic: newValue.includes('domestic'),
      use_for_international: newValue.includes('international'),
    });
  };

  get hiddenSelector(): BooleanSelector {
    const code = this.form._embedded?.['fx:shipping_method'].code;
    if (!code) return new BooleanSelector('not=shipping-method-uri,timestamps,create,delete');

    const orgControls = ['shipping-container-uri', 'shipping-drop-type-uri', 'destinations'];
    const authControls = ['authentication-key', 'meter-number', 'accountid', 'password'];
    const codeToControls: Record<string, string[]> = {
      'CUSTOM-ENDPOINT-POST': ['endpoint'],
      'CUSTOM-CODE': ['custom-code'],
      'CUSTOM': ['destinations', 'services'],
      'FedEx': [...orgControls, ...authControls, 'services'],
      'USPS': [...orgControls, 'services'],
      'UPS': [...orgControls, ...authControls, 'services'],
    };

    if (codeToControls[code]) {
      const controls = codeToControls[code];
      const set = ['shipping-method-uri', ...controls, 'timestamps', 'delete', 'create'];
      return new BooleanSelector(`not=${set.join()} ${super.hiddenSelector}`);
    } else {
      return super.hiddenSelector;
    }
  }

  renderBody(): TemplateResult {
    const method = this.form._embedded?.['fx:shipping_method'];

    return html`
      ${['method', 'container', 'drop_type'].map(tgt => {
        const curie = `fx:shipping_${tgt}` as keyof Data['_embedded'];
        const prop = `shipping_${tgt}_uri` as keyof Data;

        if (this.form._embedded?.[curie] || !this.form[prop]) return;

        return html`
          <foxy-nucleon
            class="hidden"
            infer=""
            href=${this.form[prop]}
            @update=${(evt: CustomEvent) => {
              const loader = evt.currentTarget as NucleonElement<any>;
              const data = loader.data;

              if (data) {
                const newEmbeds = { ...this.form._embedded, [curie]: data };
                this.edit({ _embedded: newEmbeds as Data['_embedded'] });
              }
            }}
          >
          </foxy-nucleon>
        `;
      })}

      <foxy-internal-async-combo-box-control
        item-value-path="_links.self.href"
        item-label-path="name"
        first=${ifDefined(this.shippingMethods ?? this.form._links?.['fx:shipping_methods'].href)}
        infer="shipping-method-uri"
        .selectedItem=${this.form._embedded?.['fx:shipping_method'] ?? null}
        @selected-item-changed=${(evt: CustomEvent) => {
          const { selectedItem } = evt.currentTarget as InternalAsyncComboBoxControl;
          const newEmbeds = { 'fx:shipping_method': selectedItem };
          type ShippingMethod = Data['_embedded']['fx:shipping_method'];

          this.edit({
            _embedded: newEmbeds as Data['_embedded'],
            shipping_container_uri: '',
            shipping_drop_type_uri: '',
            shipping_method_uri: (selectedItem as ShippingMethod)?._links.self.href ?? '',
          });
        }}
      >
      </foxy-internal-async-combo-box-control>

      <foxy-internal-async-combo-box-control
        item-value-path="_links.self.href"
        item-label-path="name"
        first=${ifDefined(method?._links['fx:shipping_containers'].href)}
        infer="shipping-container-uri"
        .selectedItem=${this.form._embedded?.['fx:shipping_container'] ?? null}
        @selected-item-changed=${(evt: CustomEvent) => {
          const { selectedItem } = evt.currentTarget as InternalAsyncComboBoxControl;
          const newEmbeds = { ...this.form._embedded, 'fx:shipping_container': selectedItem };
          type ShippingContainer = Data['_embedded']['fx:shipping_container'];

          this.edit({
            shipping_container_uri: (selectedItem as ShippingContainer)?._links.self.href ?? '',
            _embedded: newEmbeds as Data['_embedded'],
          });
        }}
      >
      </foxy-internal-async-combo-box-control>

      <foxy-internal-async-combo-box-control
        item-value-path="_links.self.href"
        item-label-path="name"
        first=${ifDefined(method?._links['fx:shipping_drop_types'].href)}
        infer="shipping-drop-type-uri"
        .selectedItem=${this.form._embedded?.['fx:shipping_drop_type'] ?? null}
        @selected-item-changed=${(evt: CustomEvent) => {
          const { selectedItem } = evt.currentTarget as InternalAsyncComboBoxControl;
          const newEmbeds = { ...this.form._embedded, 'fx:shipping_drop_type': selectedItem };
          type DropType = Data['_embedded']['fx:shipping_drop_type'];

          this.edit({
            shipping_drop_type_uri: (selectedItem as DropType)?._links.self.href ?? '',
            _embedded: newEmbeds as Data['_embedded'],
          });
        }}
      >
      </foxy-internal-async-combo-box-control>

      <foxy-internal-checkbox-group-control
        infer="destinations"
        .getValue=${this.__getDestinations}
        .setValue=${this.__setDestinations}
        .options=${this.__destinations}
      >
      </foxy-internal-checkbox-group-control>

      <foxy-internal-text-control infer="authentication-key"></foxy-internal-text-control>
      <foxy-internal-text-control infer="meter-number"></foxy-internal-text-control>

      ${method?.code === 'CUSTOM-ENDPOINT-POST'
        ? html`
            <foxy-internal-text-control infer="endpoint" property="accountid">
            </foxy-internal-text-control>
          `
        : html`<foxy-internal-text-control infer="accountid"></foxy-internal-text-control>`}

      <foxy-internal-password-control infer="password"></foxy-internal-password-control>
      <foxy-internal-text-area-control infer="custom-code"></foxy-internal-text-area-control>

      <foxy-internal-store-shipping-method-form-services-control infer="services">
      </foxy-internal-store-shipping-method-form-services-control>

      ${super.renderBody()}
    `;
  }
}
