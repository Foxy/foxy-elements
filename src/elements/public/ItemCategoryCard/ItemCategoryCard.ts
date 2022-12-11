import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'item-category-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Card element representing an item category (`fx:item_category`).
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-item-category-card
 * @since 1.21.0
 */
export class ItemCategoryCard extends Base<Data> {
  render(): TemplateResult {
    return super.render({
      title: data => html`${data.name}`,
      subtitle: data => html`${data.code}`,
    });
  }
}
