import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html } from 'lit-html';

const NS = 'product-tag-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Minimal form for creating/editing a single product tag (`fx:product_tag`).
 * Used by `<foxy-product-form>` inside its tags `InternalAsyncListControl`.
 *
 * @element foxy-product-tag-form
 * @since 1.54.0
 */
export class ProductTagForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ tag }) => !!tag || 'tag:v8n_required',
      ({ tag }) => !tag || tag.length <= 255 || 'tag:v8n_too_long',
    ];
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}
      <foxy-internal-text-control infer="tag"></foxy-internal-text-control>
      ${super.renderBody()}
    `;
  }
}
