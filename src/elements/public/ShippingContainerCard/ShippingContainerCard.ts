import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'shipping-container-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Basic card displaying a shipping container (`fx:shipping_container`).
 *
 * @element foxy-shipping-container-card
 * @since 1.28.0
 */
export class ShippingContainerCard extends Base<Data> {
  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.name}`,
      subtitle: ({ code }) => html`
        <foxy-i18n infer="" key="subtitle" .options=${{ code }}></foxy-i18n>
      `,
    });
  }
}
