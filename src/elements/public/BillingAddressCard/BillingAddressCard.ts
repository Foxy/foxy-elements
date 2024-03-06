import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'billing-address-card';
const Base = TranslatableMixin(InternalCard, NS);

/**
 * Card element representing a `fx:billing_address` resource.
 *
 * @element foxy-billing-address-card
 * @since 1.25.0
 */
export class BillingAddressCard extends Base<Data> {
  renderBody(): TemplateResult {
    return html`
      <section class="leading-none space-y-xs font-lumo">
        <p class="text-m text-body font-medium truncate">
          <foxy-i18n infer="" key="full_name" .options=${this.data}></foxy-i18n>
          &ZeroWidthSpace;
        </p>
        <p class="text-s text-secondary truncate">
          <foxy-i18n infer="" key="full_address" .options=${this.data}></foxy-i18n>
          &ZeroWidthSpace;
        </p>
      </section>
    `;
  }
}
