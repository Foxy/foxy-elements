import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { ConfigurableMixin } from '../../../../../mixins/configurable';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { ThemeableMixin } from '../../../../../mixins/themeable';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

type Data = Resource<Rels.StoreShippingServices>;
const Base = ConfigurableMixin(ThemeableMixin(NucleonElement));

export class InternalStoreShippingMethodFormServicesPageItem extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      internationalAllowed: { type: Boolean, attribute: 'international-allowed' },
      shippingServiceUri: { attribute: 'shipping-service-uri' },
      shippingMethodUri: { attribute: 'shipping-method-uri' },
    };
  }

  internationalAllowed = false;

  shippingServiceUri: string | null = null;

  shippingMethodUri: string | null = null;

  render(): TemplateResult {
    const service = this.data?._embedded['fx:store_shipping_services'][0];
    const parent = service ? undefined : this.href;
    const href = service ? service._links.self.href : undefined;

    return html`
      <foxy-internal-store-shipping-method-form-services-page-item-content
        shipping-service-uri=${ifDefined(this.shippingServiceUri ?? void 0)}
        shipping-method-uri=${ifDefined(this.shippingMethodUri ?? void 0)}
        data-testid="content"
        parent=${ifDefined(parent)}
        class="h-full"
        infer=""
        href=${ifDefined(href)}
      >
        <slot></slot>
        <span class=${this.internationalAllowed || !href ? 'text-tertiary' : 'text-error'}>
          <slot name="suffix"></slot>
        </span>
      </foxy-internal-store-shipping-method-form-services-page-item-content>
    `;
  }
}
