import type { TemplateResult } from 'lit-html';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalGiftCardCodeFormItemControl extends InternalControl {
  renderControl(): TemplateResult {
    let href: string | undefined;

    try {
      const url = new URL(
        this.nucleon?.form._links?.['fx:provisioned_by_transaction_detail_id'].href ?? ''
      );
      url.searchParams.set('zoom', 'item_options');
      href = url.toString();
    } catch {
      href = undefined;
    }

    return html`
      <foxy-internal-details summary="title" infer="" open>
        <foxy-item-card infer="item-card" class="p-m" href=${ifDefined(href)}></foxy-item-card>
      </foxy-internal-details>
    `;
  }
}
