import { TemplateResult, html } from 'lit-html';

import { CategoryRestrictionsPageItem } from './CategoryRestrictionsPageItem';
import { ConfigurableMixin } from '../../../../mixins/configurable';
import { NucleonElement } from '../../NucleonElement/NucleonElement';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { ThemeableMixin } from '../../../../mixins/themeable';
import { TranslatableMixin } from '../../../../mixins/translatable';
import { classMap } from '../../../../utils/class-map';

export class CategoryRestrictionsPage extends ConfigurableMixin(
  ScopedElementsMixin(ThemeableMixin(TranslatableMixin(NucleonElement)))
)<Resource<Rels.ItemCategories>> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-spinner': customElements.get('foxy-spinner'),
      'x-category-restrictions-page-item': CategoryRestrictionsPageItem,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      giftCardItemCategories: { type: String, attribute: 'gift-card-item-categories' },
      giftCard: { type: String, attribute: 'gift-card' },
    };
  }

  giftCardItemCategories = '';

  giftCard = '';

  render(): TemplateResult {
    const categories = this.data?._embedded['fx:item_categories'] ?? [];
    let limit = 20;

    try {
      const limitFromHref = parseInt(new URL(this.href).searchParams.get('limit') ?? '');
      if (!isNaN(limitFromHref)) limit = limitFromHref;
    } catch {
      // invalid URL, use the default
    }

    return html`
      <div class="relative">
        <div class="relative divide-y divide-contrast-10 ml-m">
          ${new Array(limit).fill(0).map((_, index) => {
            const category = categories[index];
            let href: string | undefined = undefined;

            if (category) {
              try {
                const giftCardCategoryURL = new URL(this.giftCardItemCategories);
                const categoryURL = new URL(category._links.self.href);
                const categoryID = categoryURL.pathname.split('/').pop() as string;

                giftCardCategoryURL.searchParams.set('item_category_id', categoryID);
                giftCardCategoryURL.searchParams.set('limit', '1');

                href = giftCardCategoryURL.toString();
              } catch {
                // invalid URL, ignore
              }
            }

            if (!href) return html`<div class="h-l"></div>`;

            return html`
              <x-category-restrictions-page-item
                item-category=${category._links.self.href}
                gift-card=${this.giftCard}
                class="h-l"
                group=${this.group}
                href=${href}
                lang=${this.lang}
                ns=${this.ns}
                ?disabled=${!this.in('idle') || this.disabled}
                ?readonly=${this.readonly}
              >
                ${category?.name}
              </x-category-restrictions-page-item>
            `;
          })}
        </div>

        <div
          class=${classMap({
            'pointer-events-none absolute inset-0 flex transition-opacity': true,
            'opacity-0': !!this.data,
          })}
        >
          <foxy-spinner
            layout="vertical"
            state=${this.in('fail') ? 'error' : this.in({ idle: 'template' }) ? 'empty' : 'busy'}
            class="m-auto p-m bg-base rounded-t-l rounded-b-l shadow-xs"
            lang=${this.lang}
            ns="${this.ns} ${customElements.get('foxy-spinner')?.defaultNS ?? ''}"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
