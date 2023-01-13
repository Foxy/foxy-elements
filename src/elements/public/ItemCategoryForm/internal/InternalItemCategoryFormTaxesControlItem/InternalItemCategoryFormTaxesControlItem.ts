import type { PropertyDeclarations } from 'lit-element';
import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { NucleonElement } from '../../../NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

import { ifDefined } from 'lit-html/directives/if-defined';
import { TaxCard } from '../../../TaxCard/TaxCard';
import { html } from 'lit-html';

type TaxItemCategories = Resource<Rels.TaxItemCategories>;
type TaxItemCategory = Resource<Rels.TaxItemCategory>;

export class InternalItemCategoryFormTaxesControlItem extends TaxCard {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      taxItemCategories: { attribute: 'tax-item-categories' },
      itemCategory: { attribute: 'item-category' },
    };
  }

  taxItemCategories: string | null = null;

  itemCategory: string | null = null;

  private __resourceElementIsBusy = false;

  private __queryElementData: TaxItemCategories | null = null;

  render(): TemplateResult {
    const taxItemCategory = this.__queryElementData?._embedded?.['fx:tax_item_categories']?.[0];
    let taxItemCategories: string | undefined;

    try {
      const url = new URL(this.taxItemCategories ?? '');
      const hrefAsUrl = new URL(this.href);
      const id = hrefAsUrl.pathname.split('/').pop();

      if (!id) throw new Error();

      url.searchParams.set('tax_id', id);
      url.searchParams.set('limit', '1');
      taxItemCategories = url.toString();
    } catch {
      taxItemCategories = undefined;
    }

    return html`
      <foxy-nucleon
        href=${ifDefined(taxItemCategories)}
        id="query"
        @update=${(evt: CustomEvent) => {
          const nucleon = evt.currentTarget as NucleonElement<TaxItemCategories>;
          this.__queryElementData = nucleon.data;
          this.requestUpdate();
        }}
      >
        <foxy-nucleon
          parent=${ifDefined(this.taxItemCategories ?? undefined)}
          href=${ifDefined(taxItemCategory?._links.self.href)}
          id="resource"
          @update=${(evt: CustomEvent) => {
            const nucleon = evt.currentTarget as NucleonElement<TaxItemCategories>;
            this.__resourceElementIsBusy = !nucleon.in('idle');
            this.requestUpdate();
          }}
        >
        </foxy-nucleon>
      </foxy-nucleon>

      <vaadin-checkbox
        class="px-m py-s block overflow-hidden"
        ?disabled=${!this.__queryElementData || this.__resourceElementIsBusy || this.disabled}
        ?checked=${!!taxItemCategory}
        @change=${(evt: CustomEvent) => {
          type ResourceElement = NucleonElement<TaxItemCategory>;

          const checkbox = evt.currentTarget as CheckboxElement;
          const resource = this.renderRoot.querySelector('#resource') as ResourceElement;

          if (checkbox.checked) {
            resource.edit({
              tax_uri: this.data!._links.self.href,
              item_category_uri: this.itemCategory!,
            });

            resource.submit();
          } else {
            resource.delete();
          }
        }}
      >
        ${super.render()}
      </vaadin-checkbox>
    `;
  }
}
