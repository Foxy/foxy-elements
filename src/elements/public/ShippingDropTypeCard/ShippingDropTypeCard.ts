import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'shipping-drop-type-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Basic card displaying a shipping drop type (`fx:shipping_drop_type`).
 *
 * @element foxy-shipping-drop-type-card
 * @since 1.28.0
 */
export class ShippingDropTypeCard extends Base<Data> {
  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.name}`,
      subtitle: ({ code }) => html`
        <foxy-i18n infer="" key="subtitle" .options=${{ code }}></foxy-i18n>
      `,
    });
  }
}
