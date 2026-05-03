import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../../../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { ProductCategories, ProductCategory } from '../../types';

import { TranslatableMixin } from '../../../../../mixins/translatable';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'product-category-tree';
const Base = TranslatableMixin(InternalControl, NS);

type CategoryData = Resource<ProductCategory>;

interface TreeNode {
  data: CategoryData;
  children: TreeNode[];
}

/**
 * Tree visualization for product categories. Fetches the full collection in
 * a single request (page size capped via `limit` attribute, default 300),
 * builds a tree client-side from `parent_id` relations, and renders
 * recursively as nested `<details>` blocks.
 *
 * The control is **display-only** — it dispatches DOM events for the
 * "add", "edit", and "delete" actions; the host page is responsible for
 * opening dialogs / wiring forms. After any mutation the host should set
 * `.refresh = Date.now()` (or change the `first` URL) to trigger a
 * re-fetch.
 *
 * Events:
 * - `productcategory:create` — `detail.parent_id` is the parent (or `null` for a root).
 * - `productcategory:edit`   — `detail.id` is the category id.
 * - `productcategory:delete` — `detail.id` is the category id.
 *
 * @element foxy-internal-product-category-tree-control
 * @since 1.54.0
 */
export class InternalProductCategoryTreeControl extends Base {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      first: { type: String },
      limit: { type: Number },
      refresh: { type: Number },
    };
  }

  /** Collection URL for `fx:product_categories`. */
  first: string | null = null;

  /** Maximum number of categories to fetch (single page). */
  limit = 300;

  /** Bump this to force a re-fetch after a mutation. */
  refresh = 0;

  private readonly __loaderId = 'productCategoriesLoader';

  renderControl(): TemplateResult {
    const fetchUrl = this.__buildFetchUrl();

    return html`
      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(fetchUrl)}
        id=${this.__loaderId}
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>

      <div data-testid="tree" class="leading-s">
        ${this.__renderForest(this.__tree)}
        <div class="mt-s">
          <button
            type="button"
            class="text-primary cursor-pointer hover-underline"
            data-testid="add-root"
            @click=${() => this.__dispatch('productcategory:create', { parent_id: null })}
          >
            <foxy-i18n infer="" key="add_root_category"></foxy-i18n>
          </button>
        </div>
      </div>
    `;
  }

  private __buildFetchUrl(): string | undefined {
    if (!this.first) return undefined;
    try {
      const url = new URL(this.first);
      url.searchParams.set('limit', String(this.limit));
      // Use `refresh` only as a cache-buster; the actual value isn't read by the API.
      if (this.refresh) url.searchParams.set('_refresh', String(this.refresh));
      return url.toString();
    } catch {
      return this.first;
    }
  }

  private get __collection(): Resource<ProductCategories> | null {
    type Loader = NucleonElement<Resource<ProductCategories>>;
    const selector = `#${this.__loaderId}`;
    return this.renderRoot.querySelector<Loader>(selector)?.data ?? null;
  }

  private get __tree(): TreeNode[] {
    const items = (this.__collection?._embedded?.['fx:product_categories'] ?? []) as CategoryData[];
    if (!items.length) return [];

    // Build by id, then attach children to their parents.
    const byId = new Map<number, TreeNode>();
    for (const item of items) {
      byId.set(item.id, { data: item, children: [] });
    }

    const roots: TreeNode[] = [];
    for (const node of byId.values()) {
      const parentId = node.data.parent_id;
      if (parentId != null && byId.has(parentId)) {
        byId.get(parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    // Sort siblings by sort_order, then name, for stable rendering.
    const sortFn = (a: TreeNode, b: TreeNode): number => {
      const so = (a.data.sort_order ?? 0) - (b.data.sort_order ?? 0);
      return so !== 0 ? so : a.data.name.localeCompare(b.data.name);
    };
    const sortRecursively = (nodes: TreeNode[]): void => {
      nodes.sort(sortFn);
      for (const n of nodes) sortRecursively(n.children);
    };
    sortRecursively(roots);

    return roots;
  }

  private __renderForest(nodes: TreeNode[]): TemplateResult {
    if (!nodes.length) {
      return html`
        <p class="text-secondary text-s" data-testid="empty">
          <foxy-i18n infer="" key="empty_tree"></foxy-i18n>
        </p>
      `;
    }
    return html`<ul class="space-y-xs pl-0" style="list-style: none">
      ${nodes.map(node => this.__renderNode(node))}
    </ul>`;
  }

  private __renderNode(node: TreeNode): TemplateResult {
    const hasChildren = node.children.length > 0;
    return html`
      <li data-testid="node" data-id=${node.data.id}>
        <details ?open=${hasChildren}>
          <summary class="flex items-center" style="gap: 0.5rem">
            <span class="font-medium truncate">${node.data.name}</span>
            <span class="text-tertiary text-s truncate">${node.data.slug}</span>
            <span class="flex-1"></span>
            <button
              type="button"
              class="text-primary cursor-pointer text-s hover-underline"
              data-testid="add-child"
              data-id=${node.data.id}
              @click=${(e: Event) => {
                e.preventDefault();
                this.__dispatch('productcategory:create', { parent_id: node.data.id });
              }}
            >
              <foxy-i18n infer="" key="add_child"></foxy-i18n>
            </button>
            <button
              type="button"
              class="text-primary cursor-pointer text-s hover-underline"
              data-testid="edit"
              data-id=${node.data.id}
              @click=${(e: Event) => {
                e.preventDefault();
                this.__dispatch('productcategory:edit', { id: node.data.id });
              }}
            >
              <foxy-i18n infer="" key="edit"></foxy-i18n>
            </button>
            <button
              type="button"
              class="text-error cursor-pointer text-s hover-underline"
              data-testid="delete"
              data-id=${node.data.id}
              @click=${(e: Event) => {
                e.preventDefault();
                this.__dispatch('productcategory:delete', { id: node.data.id });
              }}
            >
              <foxy-i18n infer="" key="delete"></foxy-i18n>
            </button>
          </summary>
          ${hasChildren
            ? html`<div class="pl-m mt-xs">${this.__renderForest(node.children)}</div>`
            : ''}
        </details>
      </li>
    `;
  }

  private __dispatch(type: string, detail: Record<string, unknown>): void {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }
}
