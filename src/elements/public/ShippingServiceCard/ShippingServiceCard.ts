import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'shipping-service-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Basic card displaying a shipping service (`fx:shipping_service`).
 *
 * @element foxy-shipping-service-card
 * @since 1.28.0
 */
export class ShippingServiceCard extends Base<Data> {
  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.name}`,
      subtitle: data => html`
        <foxy-i18n
          infer=""
          key="subtitle"
          .options=${{
            context: data.is_international ? 'international_only' : '',
            code: data.code,
          }}
        >
        </foxy-i18n>
      `,
    });
  }
}
