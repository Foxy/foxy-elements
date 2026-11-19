import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'product-collection-form';
const Base = TranslatableMixin(InternalForm, NS);

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Form element for a product collection (`fx:product_collection`).
 *
 * Collections form a tree via `parent_id`. The `path` field is server-computed
 * and read-only. Slug is auto-generated from the name when left blank.
 *
 * @element foxy-product-collection-form
 * @since 1.62.0
 */
export class ProductCollectionForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      productCollections: { attribute: 'product-collections' },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name }) => !!name || 'name:v8n_required',
      ({ name }) => !name || name.length <= 255 || 'name:v8n_too_long',
      ({ slug }) => !!slug || 'slug:v8n_required',
      ({ slug }) => !slug || slug.length <= 255 || 'slug:v8n_too_long',
      ({ slug }) => !slug || SLUG_PATTERN.test(slug) || 'slug:v8n_invalid',
    ];
  }

  /** Link to the `fx:product_collections` collection used by the parent picker. */
  productCollections: string | null = null;

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-summary-control infer="general">
        <foxy-internal-text-control layout="summary-item" infer="name"></foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="slug"></foxy-internal-text-control>
        <foxy-internal-resource-picker-control
          layout="summary-item"
          first=${ifDefined(this.productCollections ?? undefined)}
          infer="parent"
          property="parent_id"
          item="foxy-product-collection-card"
        >
        </foxy-internal-resource-picker-control>
        <foxy-internal-number-control
          layout="summary-item"
          infer="sort-order"
          step="1"
          property="sort_order"
        >
        </foxy-internal-number-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }
}
