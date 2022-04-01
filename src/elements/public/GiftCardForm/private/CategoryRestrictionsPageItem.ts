import { TemplateResult, html } from 'lit-html';

import { CategoryRestrictionsPageItemContent } from './CategoryRestrictionsPageItemContent';
import { ConfigurableMixin } from '../../../../mixins/configurable';
import { NucleonElement } from '../../NucleonElement/NucleonElement';
import { PropertyDeclarations } from 'lit-element';
import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { ThemeableMixin } from '../../../../mixins/themeable';
import { ifDefined } from 'lit-html/directives/if-defined';

type Data = Resource<Rels.GiftCardItemCategories>;
const Base = ConfigurableMixin(ScopedElementsMixin(ThemeableMixin(NucleonElement)));

export class CategoryRestrictionsPageItem extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-spinner': customElements.get('foxy-spinner'),
      'x-category-restrictions-page-item-content': CategoryRestrictionsPageItemContent,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      itemCategory: { type: String, attribute: 'item-category' },
      giftCard: { type: String, attribute: 'gift-card' },
    };
  }

  itemCategory = '';

  giftCard = '';

  render(): TemplateResult {
    const category = this.data?._embedded['fx:gift_card_item_categories'][0];
    const parent = category ? undefined : this.href;
    const href = category ? category._links.self.href : undefined;

    return html`
      <x-category-restrictions-page-item-content
        item-category=${this.itemCategory}
        data-testid="content"
        gift-card=${this.giftCard}
        parent=${ifDefined(parent)}
        class="h-full"
        group=${this.group}
        href=${ifDefined(href)}
        ?disabled=${!this.in('idle') || this.disabled}
        ?readonly=${this.readonly}
      >
        <slot></slot>
      </x-category-restrictions-page-item-content>
    `;
  }
}
