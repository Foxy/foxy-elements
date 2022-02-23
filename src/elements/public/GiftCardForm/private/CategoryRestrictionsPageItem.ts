import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { PropertyDeclarations } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { ConfigurableMixin } from '../../../../mixins/configurable';
import { ThemeableMixin } from '../../../../mixins/themeable';
import { TranslatableMixin } from '../../../../mixins/translatable';
import { NucleonElement } from '../../NucleonElement/NucleonElement';
import { CategoryRestrictionsPageItemContent } from './CategoryRestrictionsPageItemContent';

type Data = {
  _links: { self: { href: string } };
  _embedded: { 'fx:gift_card_item_categories': { _links: { self: { href: string } } }[] };
};

const Base = ConfigurableMixin(
  ScopedElementsMixin(ThemeableMixin(TranslatableMixin(NucleonElement)))
);

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
        gift-card=${this.giftCard}
        parent=${ifDefined(parent)}
        class="h-full"
        group=${this.group}
        href=${ifDefined(href)}
        lang=${this.lang}
        ns=${this.ns}
        ?disabled=${!this.in('idle') || this.disabled}
        ?readonly=${this.readonly}
      >
        <slot></slot>
      </x-category-restrictions-page-item-content>
    `;
  }
}
