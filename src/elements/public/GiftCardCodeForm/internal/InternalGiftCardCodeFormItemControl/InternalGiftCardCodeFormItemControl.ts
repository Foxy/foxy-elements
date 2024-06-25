import type { TemplateResult } from 'lit-html';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalGiftCardCodeFormItemControl extends InternalControl {
  renderControl(): TemplateResult {
    let href: string | undefined;

    try {
      const url = new URL(
        this.nucleon?.data?._links?.['fx:provisioned_by_transaction_detail_id'].href ?? ''
      );
      url.searchParams.set('zoom', 'item_options');
      href = url.toString();
    } catch {
      href = undefined;
    }

    return html`
      <foxy-i18n
        infer=""
        class="text-secondary block text-s font-medium leading-xs mb-xs"
        key="label"
      >
      </foxy-i18n>

      <foxy-item-card
        class="block rounded ring-1 ring-contrast-10"
        style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
        infer="card"
        href=${ifDefined(href)}
      >
      </foxy-item-card>
    `;
  }
}
