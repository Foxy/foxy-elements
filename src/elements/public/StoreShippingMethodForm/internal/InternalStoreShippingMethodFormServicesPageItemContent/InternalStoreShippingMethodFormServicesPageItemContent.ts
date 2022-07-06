import { TemplateResult, html } from 'lit-html';
import { CheckboxElement } from '@vaadin/vaadin-checkbox';
import { ConfigurableMixin } from '../../../../../mixins/configurable';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ThemeableMixin } from '../../../../../mixins/themeable';

type Data = Resource<Rels.StoreShippingService>;
const Base = ConfigurableMixin(ThemeableMixin(NucleonElement));

export class InternalStoreShippingMethodFormServicesPageItemContent extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      shippingServiceUri: { type: String, attribute: 'shipping-service-uri' },
      shippingMethodUri: { type: String, attribute: 'shipping-method-uri' },
    };
  }

  shippingServiceUri: string | null = null;

  shippingMethodUri: string | null = null;

  render(): TemplateResult {
    return html`
      <div class="h-full flex items-center">
        <vaadin-checkbox
          data-testid="checkbox"
          class="w-full"
          ?disabled=${!this.in('idle') || this.disabled}
          ?readonly=${this.readonly}
          ?checked=${!!this.data}
          @change=${(evt: CustomEvent) => {
            const checkbox = evt.currentTarget as CheckboxElement;

            if (checkbox.checked) {
              this.edit({
                shipping_service_uri: this.shippingServiceUri ?? '',
                shipping_method_uri: this.shippingMethodUri ?? '',
              });

              this.submit();
            } else {
              this.delete();
            }
          }}
        >
          <slot></slot>
        </vaadin-checkbox>
      </div>
    `;
  }
}
