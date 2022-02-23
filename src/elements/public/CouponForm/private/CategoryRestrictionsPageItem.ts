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
import { TranslatableMixin } from '../../../../mixins/translatable';
import { ifDefined } from 'lit-html/directives/if-defined';

export class CategoryRestrictionsPageItem extends ConfigurableMixin(
  ScopedElementsMixin(ThemeableMixin(TranslatableMixin(NucleonElement)))
)<Resource<Rels.CouponItemCategories>> {
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
      coupon: { type: String },
    };
  }

  itemCategory = '';

  coupon = '';

  render(): TemplateResult {
    const category = this.data?._embedded['fx:coupon_item_categories'][0];
    const parent = category ? undefined : this.href;
    const href = category ? category._links.self.href : undefined;

    return html`
      <x-category-restrictions-page-item-content
        item-category=${this.itemCategory}
        coupon=${this.coupon}
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