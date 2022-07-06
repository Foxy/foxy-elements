import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'store-shipping-method-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * A basic card displaying a store shipping method (`fx:store_shipping_method`).
 *
 * @element foxy-store-shipping-method-card
 * @since 1.18.0
 */
export class StoreShippingMethodCard extends Base<Data> {
  renderBody(): TemplateResult {
    return html`
      <dl class="items-center gap-x-s grid -my-xs" style="grid-template-columns: min-content 1fr">
        <dt title=${this.t('shipping_method')} class="sr-only">
          <foxy-i18n infer="" key="shipping_method"></foxy-i18n>
        </dt>

        <dd class="font-semibold truncate col-span-2">
          ${this.data?._embedded?.['fx:shipping_method']?.name ?? '--'}
        </dd>

        <dt class="text-secondary" title=${this.t('shipping_container')}>
          <iron-icon class="icon-inline" icon="maps:zoom-out-map"></iron-icon>
        </dt>

        <dd class="text-secondary truncate">
          ${this.data?._embedded?.['fx:shipping_container']?.name ?? '--'}
        </dd>

        <dt class="text-secondary" title=${this.t('shipping_drop_type')}>
          <iron-icon class="icon-inline" icon="maps:pin-drop"></iron-icon>
        </dt>

        <dd class="text-secondary truncate">
          ${this.data?._embedded?.['fx:shipping_drop_type']?.name ?? '--'}
        </dd>

        <dt class="text-secondary" title=${this.t('destinations')}>
          <iron-icon class="icon-inline" icon="maps:map"></iron-icon>
        </dt>

        <dd class="text-secondary truncate">
          <foxy-i18n
            infer=""
            key=${this.data?.use_for_domestic && this.data?.use_for_international
              ? 'destinations_any'
              : this.data?.use_for_domestic
              ? 'destinations_domestic'
              : this.data?.use_for_international
              ? 'destinations_international'
              : 'destinations_none'}
          >
          </foxy-i18n>
        </dd>
      </dl>
    `;
  }
}
