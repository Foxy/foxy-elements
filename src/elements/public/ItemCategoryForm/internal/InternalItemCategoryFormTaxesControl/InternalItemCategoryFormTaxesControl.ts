import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { Data } from '../../types';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { html } from 'lit-html';

export class InternalItemCategoryFormTaxesControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      taxes: { type: String },
    };
  }

  taxes: string | null = null;

  renderControl(): TemplateResult {
    const nucleon = this.nucleon as NucleonElement<Data> | null;
    let taxes: string;

    try {
      const url = new URL(this.taxes ?? '');
      url.searchParams.set('limit', '5');
      taxes = url.toString();
    } catch {
      taxes = this.taxes ?? '';
    }

    return html`
      <foxy-i18n
        class="block text-s font-medium text-secondary leading-none mb-s"
        infer=""
        key="title"
      >
      </foxy-i18n>

      <foxy-pagination first=${taxes} infer="pagination">
        <foxy-collection-page
          class="block mb-s divide-y divide-contrast-10 border border-contrast-10 rounded-t-l rounded-b-l"
          infer=""
          item="foxy-internal-item-category-form-taxes-control-item"
          .props=${{
            'tax-item-categories': nucleon?.form._links?.['fx:tax_item_categories'].href ?? '',
            'item-category': nucleon?.href,
          }}
        >
        </foxy-collection-page>
      </foxy-pagination>

      <foxy-i18n class="block text-xs text-secondary leading-xs mt-xs" infer="" key="helper_text">
      </foxy-i18n>
    `;
  }
}
