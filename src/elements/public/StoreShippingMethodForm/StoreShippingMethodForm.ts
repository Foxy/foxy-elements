import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
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
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      shippingMethods: { attribute: 'shipping-methods' },
      __useCustomAccount: { attribute: false },
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
    ];
  }

  /** URL of the `fx:shipping_methods` property helper. */
  shippingMethods: string | null = null;

  private readonly __shippingMethodLoaderId = 'shippingMethodLoader';

  private readonly __shippingMethodUriSetValue = (newValue: string) => {
    this.undo();
    this.edit({ shipping_method_uri: newValue });
  };

  private __useCustomAccount = false;

  private readonly __useCustomAccountGetValue = () => {
    return Boolean(
      this.__useCustomAccount ||
        this.form.authentication_key ||
        this.form.meter_number ||
        this.form.accountid ||
        this.form.password
    );
  };

  private readonly __useCustomAccountSetValue = (value: boolean) => {
    if (!value) {
      this.edit({
        authentication_key: '',
        meter_number: '',
        accountid: '',
        password: '',
      });
    }

    this.__useCustomAccount = value;
  };

  get hiddenSelector(): BooleanSelector {
    const hasData = !!this.data;
    const code = this.__shippingMethod?.code;

    // prettier-ignore
    let hiddenControls = 'general:shipping-container-uri general:shipping-drop-type-uri destinations account endpoint custom-code';

    if (code) {
      const codeToHiddenControls: Record<string, string> = {
        'CUSTOM-ENDPOINT-POST': 'general destinations account custom-code',
        'CUSTOM-CODE': 'general destinations account endpoint',
        'CUSTOM': 'general account endpoint custom-code',
        'FedEx': 'endpoint custom-code',
        'USPS': 'account endpoint custom-code',
        'UPS': 'endpoint custom-code',
      };

      if (codeToHiddenControls[code]) hiddenControls = codeToHiddenControls[code];
    }

    if (!hasData || code?.startsWith('CUSTOM-')) hiddenControls += ' services';
    if (hasData) hiddenControls = `general:shipping-method-uri ${hiddenControls}`;

    // prettier-ignore
    if (!this.__useCustomAccountGetValue()) hiddenControls += ' account:accountid account:password account:authentication-key account:meter-number';

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

      <foxy-internal-summary-control infer="general">
        <foxy-internal-resource-picker-control
          layout="summary-item"
          infer="shipping-method-uri"
          first=${ifDefined(this.shippingMethods ?? this.form._links?.['fx:shipping_methods'].href)}
          item="foxy-shipping-method-card"
          .setValue=${this.__shippingMethodUriSetValue}
        >
        </foxy-internal-resource-picker-control>

        <foxy-internal-resource-picker-control
          layout="summary-item"
          infer="shipping-container-uri"
          first=${ifDefined(shippingMethod?._links['fx:shipping_containers'].href)}
          item="foxy-shipping-container-card"
        >
        </foxy-internal-resource-picker-control>

        <foxy-internal-resource-picker-control
          layout="summary-item"
          infer="shipping-drop-type-uri"
          first=${ifDefined(shippingMethod?._links['fx:shipping_drop_types'].href)}
          item="foxy-shipping-drop-type-card"
        >
        </foxy-internal-resource-picker-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="destinations">
        <foxy-internal-switch-control infer="use-for-domestic"></foxy-internal-switch-control>
        <foxy-internal-switch-control infer="use-for-international"></foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="account">
        <foxy-internal-switch-control
          infer="use-custom-account"
          .getValue=${this.__useCustomAccountGetValue}
          .setValue=${this.__useCustomAccountSetValue}
        >
        </foxy-internal-switch-control>
        <foxy-internal-text-control layout="summary-item" infer="authentication-key">
        </foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="meter-number">
        </foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="accountid">
        </foxy-internal-text-control>
        <foxy-internal-password-control layout="summary-item" infer="password">
        </foxy-internal-password-control>
      </foxy-internal-summary-control>

      <foxy-internal-text-control infer="endpoint" property="accountid">
      </foxy-internal-text-control>

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
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      ${super.renderBody()}
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (changes.has('href')) this.__useCustomAccount = false;
  }

  protected async _fetch<TResult = Data>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    try {
      return await super._fetch(...args);
    } catch (err) {
      const errors: string[] = [];

      try {
        for (const error of (await (err as Response).json())._embedded['fx:errors']) {
          if (error.message.startsWith('shipping_container_id must be')) {
            errors.push('shipping-container-uri:v8n_required');
          } else if (error.message.startsWith('shipping_drop_type_id must be')) {
            errors.push('shipping-drop-type-uri:v8n_required');
          }
        }
      } catch {
        // no-op
      }

      throw errors.length > 0 ? errors : err;
    }
  }

  private get __shippingMethodLoader() {
    type Loader = NucleonElement<Resource<Rels.ShippingMethod>>;
    return this.renderRoot.querySelector<Loader>(`#${this.__shippingMethodLoaderId}`);
  }

  private get __shippingMethod() {
    return this.__shippingMethodLoader?.data;
  }
}
