import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'product-category-card';
const Base = ConfigurableMixin(TranslatableMixin(TwoLineCard, NS));

/**
 * Card element for a product category (`fx:product_category`). Two-line
 * layout matching ItemCategoryCard's visual style: name on top, slug below.
 *
 * @element foxy-product-category-card
 * @since 1.54.0
 */
export class ProductCategoryCard extends Base<Data> {
  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.name}`,
      subtitle: data => html`${data.slug}`,
    });
  }
}
