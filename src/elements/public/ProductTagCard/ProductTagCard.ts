import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'product-tag-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * Minimal card displaying a product tag as a chip.
 *
 * @element foxy-product-tag-card
 * @since 1.54.0
 */
export class ProductTagCard extends Base<Data> {
  renderBody(): TemplateResult {
    return html`
      <span
        class="inline-block px-s py-xs rounded-s bg-contrast-10 text-s leading-xs"
        data-testid="tag"
      >
        ${this.data?.tag ?? ''}
      </span>
    `;
  }
}
