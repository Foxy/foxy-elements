import { TemplateResult, html } from 'lit-html';
import { ConfigurableMixin } from '../../../../../mixins/configurable';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ThemeableMixin } from '../../../../../mixins/themeable';
import { TranslatableMixin } from '../../../../../mixins/translatable';
import { classMap } from '../../../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';

type Data = Resource<Rels.ShippingServices>;
const Base = ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement)));

export class InternalStoreShippingMethodFormServicesPage extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      storeShippingServicesUri: { type: String, attribute: 'store-shipping-services-uri' },
      internationalAllowed: { type: Boolean, attribute: 'international-allowed' },
      shippingMethodUri: { type: String, attribute: 'shipping-method-uri' },
    };
  }

  storeShippingServicesUri: string | null = null;

  internationalAllowed = false;

  shippingMethodUri: string | null = null;

  render(): TemplateResult {
    const services = this.data?._embedded['fx:shipping_services'] ?? [];
    let limit = 20;

    try {
      const limitFromHref = parseInt(new URL(this.href).searchParams.get('limit') ?? '');
      if (!isNaN(limitFromHref)) limit = limitFromHref;
    } catch {
      // invalid URL, use the default
    }

    return html`
      <div class="relative">
        <div class="relative divide-y divide-contrast-10 ml-m">
          ${new Array(limit).fill(0).map((_, index) => {
            const service = services[index];
            let href: string | undefined = undefined;

            if (service) {
              try {
                const storeShippingServiceURL = new URL(this.storeShippingServicesUri ?? '');
                const shippingServiceURL = new URL(service._links.self.href);
                const shippingServiceID = shippingServiceURL.pathname.split('/').pop() as string;

                storeShippingServiceURL.searchParams.set('shipping_service_id', shippingServiceID);
                storeShippingServiceURL.searchParams.set('limit', '1');

                href = storeShippingServiceURL.toString();
              } catch {
                // invalid URL, ignore
              }
            }

            if (!href) return html`<div class="h-l"></div>`;

            return html`
              <foxy-internal-store-shipping-method-form-services-page-item
                shipping-service-uri=${service._links.self.href}
                shipping-method-uri=${ifDefined(this.shippingMethodUri ?? void 0)}
                data-testclass="item"
                class="min-h-l"
                infer=""
                href=${href}
                ?international-allowed=${this.internationalAllowed}
              >
                ${service?.name}
                ${service.is_international
                  ? html`<foxy-i18n infer="" slot="suffix" key="international_only"></foxy-i18n>`
                  : ''}
              </foxy-internal-store-shipping-method-form-services-page-item>
            `;
          })}
        </div>

        <div
          data-testid="spinner"
          class=${classMap({
            'pointer-events-none absolute inset-0 flex transition-opacity': true,
            'opacity-0': !!this.data,
          })}
        >
          <foxy-spinner
            layout="vertical"
            state=${this.in('fail') ? 'error' : this.in({ idle: 'template' }) ? 'empty' : 'busy'}
            class="m-auto p-m bg-base rounded-t-l rounded-b-l shadow-xs"
            infer=""
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
