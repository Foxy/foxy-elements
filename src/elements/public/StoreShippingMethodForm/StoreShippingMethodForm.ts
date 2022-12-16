import type { InternalAsyncComboBoxControl } from '../../internal/InternalAsyncComboBoxControl/InternalAsyncComboBoxControl';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

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
 * @element foxy-store-shipping-method-form
 * @since 1.21.0
 */
export class StoreShippingMethodForm extends Base<Data> {
  static get properties(): typeof Base['properties'] {
    return {
      ...super.properties,
      shippingMethods: { type: String, attribute: 'shipping-methods' },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ shipping_method_uri: v }) => (v && isURL(v)) || 'shipping-method-uri:required',
      ({ accountid: v }) => !v || v.length <= 50 || 'accountid:too_long',
      ({ password: v }) => !v || v.length <= 50 || 'password:too_long',
      ({ meter_number: v }) => !v || v.length <= 50 || 'meter-number:too_long',
      ({ authentication_key: v }) => !v || v.length <= 50 || 'authentication-key:too_long',
      ({ custom_code: v }) => !v || getKbSize(v) <= 64 || 'custom-code:too_long',

      form => {
        if (form._embedded?.['fx:shipping_method'].code === 'CUSTOM-ENDPOINT-POST') {
          return (form.accountid && isURL(form.accountid)) || 'endpoint:required';
        } else {
          return true;
        }
      },

      form => {
        const url = form.shipping_container_uri;
        const code = form._embedded?.['fx:shipping_method'].code;
        const codes = ['USPS', 'FedEx', 'UPS'];

        if (code && codes.includes(code)) {
          return (url && isURL(url)) || 'shipping-container-uri:required';
        } else {
          return true;
        }
      },

      form => {
        const url = form.shipping_drop_type_uri;
        const code = form._embedded?.['fx:shipping_method'].code;
        const codes = ['FedEx', 'UPS'];

        if (code && codes.includes(code)) {
          return (url && isURL(url)) || 'shipping-drop-type-uri:required';
        } else {
          return true;
        }
      },
    ];
  }

  shippingMethods: string | null = null;

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
        .selectedItem=${this.form._embedded?.['fx:shipping_method']}
        @selected-item-changed=${(evt: CustomEvent) => {
          const { selectedItem } = evt.currentTarget as InternalAsyncComboBoxControl;
          const newEmbeds = { 'fx:shipping_method': selectedItem };

          this.edit({
            _embedded: newEmbeds as Data['_embedded'],
            shipping_container_uri: '',
            shipping_drop_type_uri: '',
          });
        }}
      >
      </foxy-internal-async-combo-box-control>

      <foxy-internal-async-combo-box-control
        item-value-path="_links.self.href"
        item-label-path="name"
        first=${ifDefined(method?._links['fx:shipping_containers'].href)}
        infer="shipping-container-uri"
        .selectedItem=${this.form._embedded?.['fx:shipping_container']}
        @selected-item-changed=${(evt: CustomEvent) => {
          const { selectedItem } = evt.currentTarget as InternalAsyncComboBoxControl;
          const newEmbeds = { ...this.form._embedded, 'fx:shipping_container': selectedItem };
          this.edit({ _embedded: newEmbeds as Data['_embedded'] });
        }}
      >
      </foxy-internal-async-combo-box-control>

      <foxy-internal-async-combo-box-control
        item-value-path="_links.self.href"
        item-label-path="name"
        first=${ifDefined(method?._links['fx:shipping_drop_types'].href)}
        infer="shipping-drop-type-uri"
        .selectedItem=${this.form._embedded?.['fx:shipping_drop_type']}
        @selected-item-changed=${(evt: CustomEvent) => {
          const { selectedItem } = evt.currentTarget as InternalAsyncComboBoxControl;
          const newEmbeds = { ...this.form._embedded, 'fx:shipping_drop_type': selectedItem };
          this.edit({ _embedded: newEmbeds as Data['_embedded'] });
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

      <foxy-internal-text-control infer="authentication-key"> </foxy-internal-text-control>
      <foxy-internal-text-control infer="meter-number"></foxy-internal-text-control>

      <foxy-internal-text-control
        infer=${method?.code === 'CUSTOM-ENDPOINT-POST' ? 'endpoint' : 'accountid'}
        property="accountid"
      >
      </foxy-internal-text-control>

      <foxy-internal-text-control infer="password"></foxy-internal-text-control>
      <foxy-internal-text-area-control infer="custom-code"></foxy-internal-text-area-control>

      <foxy-internal-store-shipping-method-form-services-control infer="services">
      </foxy-internal-store-shipping-method-form-services-control>

      ${super.renderBody()}
    `;
  }
}
