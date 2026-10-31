import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

const NS = 'product-collection-card';
const Base = ConfigurableMixin(TranslatableMixin(TwoLineCard, NS));

/**
 * Card element for a product collection (`fx:product_collection`). Two-line
 * layout matching ItemCategoryCard's visual style: name on top, slug below.
 *
 * @element foxy-product-collection-card
 * @since 1.54.0
 */
export class ProductCollectionCard extends Base<Data> {
  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.name}`,
      subtitle: data => html`${data.slug}`,
    });
  }
}
