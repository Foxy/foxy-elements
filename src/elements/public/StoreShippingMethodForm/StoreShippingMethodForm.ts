import type { InternalAsyncComboBoxControl } from '../../internal/InternalAsyncComboBoxControl/InternalAsyncComboBoxControl';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
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
 * @since 1.18.0
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
      // TODO remove error directive after SDK types are fixed
      // @ts-expect-error SDK types are wrong
      use_for_domestic: newValue.includes('domestic'),

      // TODO remove error directive after SDK types are fixed
      // @ts-expect-error SDK types are wrong
      use_for_international: newValue.includes('international'),
    });
  };

  renderBody(): TemplateResult {
    return html`
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
      ${this.form._embedded?.['fx:shipping_method'].code === 'CUSTOM-CODE'
        ? this.__renderCustomCodeMethodLayout()
        : this.__renderGenericMethodLayout()}
      ${super.renderBody()}
    `;
  }

  private __renderCustomCodeMethodLayout() {
    return html`
      <foxy-internal-text-area-control infer="custom-code"></foxy-internal-text-area-control>
    `;
  }

  private __renderGenericMethodLayout() {
    const method = this.form._embedded?.['fx:shipping_method'];

    return html`
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

      <foxy-internal-text-control infer="authentication-key"></foxy-internal-text-control>
      <foxy-internal-text-control infer="meter-number"></foxy-internal-text-control>
      <foxy-internal-text-control infer="accountid"></foxy-internal-text-control>
      <foxy-internal-text-control infer="password"></foxy-internal-text-control>

      ${this.data && this.data.shipping_method_uri === this.form.shipping_method_uri
        ? html`
            <foxy-internal-store-shipping-method-form-services-control infer="services">
            </foxy-internal-store-shipping-method-form-services-control>
          `
        : ''}
    `;
  }
}
