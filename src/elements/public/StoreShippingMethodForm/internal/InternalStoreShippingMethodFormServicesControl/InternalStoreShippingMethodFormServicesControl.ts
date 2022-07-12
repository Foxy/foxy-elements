import { html, TemplateResult } from 'lit-html';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { Data } from '../../types';

export class InternalStoreShippingMethodFormServicesControl extends InternalControl {
  renderControl(): TemplateResult {
    const data = this.nucleon?.data as Data;
    const form = this.nucleon?.form as Partial<Data>;

    if (!data) return html``;

    const firstURL = new URL(data._links['fx:shipping_services'].href);
    firstURL.searchParams.set('limit', '10');

    return html`
      <foxy-pagination first=${firstURL.toString()} infer="">
        <foxy-i18n
          class="block text-s font-medium text-secondary leading-none mb-s"
          infer=""
          key="header"
        >
        </foxy-i18n>

        <foxy-internal-store-shipping-method-form-services-page
          store-shipping-services-uri=${data._links['fx:store_shipping_services'].href}
          shipping-method-uri=${data._links['fx:shipping_method'].href}
          class="border border-contrast-10 rounded-t-l rounded-b-l mb-s"
          infer=""
          ?international-allowed=${!!form.use_for_international}
        >
        </foxy-internal-store-shipping-method-form-services-page>
      </foxy-pagination>
    `;
  }
}
