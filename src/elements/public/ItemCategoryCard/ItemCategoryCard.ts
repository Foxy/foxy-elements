import type { TemplateResult } from 'lit-html';
import type { Data } from './types';
import type { ScopeCollection } from '../../../utils/user-scope';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'item-category-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Card element representing an item category (`fx:item_category`).
 *
 * @element foxy-item-category-card
 * @since 1.21.0
 */
export class ItemCategoryCard extends Base<Data> {
  get scopeCollection(): ScopeCollection | null {
    return 'item_categories';
  }

  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.name}`,
      subtitle: data => html`${data.code}`,
    });
  }
}
