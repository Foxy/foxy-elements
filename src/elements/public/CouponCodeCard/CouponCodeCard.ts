import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'coupon-code-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * Card element that displays a coupon code (`fx:coupon_code`).
 *
 * @element foxy-coupon-code-card
 * @since 1.27.0
 */
export class CouponCodeCard extends Base<Data> {
  renderBody(): TemplateResult {
    return html`
      <section class="h-s flex flex-col justify-center leading-xs">
        <p class="flex items-center justify-between min-w-0">
          <foxy-i18n
            infer=""
            class="block truncate text-m font-medium"
            key="line_1"
            .options=${this.data}
          >
          </foxy-i18n>
          <foxy-i18n
            infer=""
            class="text-s text-tertiary"
            key="uses_count"
            .options=${{ count: this.data?.number_of_uses_to_date }}
          >
          </foxy-i18n>
        </p>
        <p class="text-s text-secondary min-w-0">
          <foxy-i18n infer="" class="block truncate" key="line_2" .options=${this.data}>
          </foxy-i18n>
        </p>
      </section>
    `;
  }
}
