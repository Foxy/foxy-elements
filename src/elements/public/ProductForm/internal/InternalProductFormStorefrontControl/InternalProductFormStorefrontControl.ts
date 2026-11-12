import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Data, ProductModifier } from '../../types';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { variantLabel } from '../../../ProductList/listing';
import { isRemoval } from '../../catalog';
import { html } from 'lit-element';

type Kind = 'link' | 'button' | 'form' | 'tile' | 'page';

const TAGS: Record<Exclude<Kind, 'link'>, string> = {
  button: 'foxy-product-link',
  form: 'foxy-product-form',
  tile: 'foxy-product-tile',
  page: 'foxy-product-page',
};

const escapeAttribute = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * What puts the saved product on a storefront: an add-to-cart link, or the
 * snippet for one of the storefront elements. A link or a button adds one
 * SKU, so a product with variants has the merchant pick which.
 *
 * @element foxy-internal-product-form-storefront-control
 */
export class InternalProductFormStorefrontControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      lookHref: { attribute: 'look-href' },
      modifiers: { attribute: false },
      variants: { attribute: false },
      product: { attribute: false },
      script: {},
      host: {},
      __variant: { attribute: false },
      __kind: { attribute: false },
    };
  }

  /** The store's host, such as `example.foxycart.com`. */
  host: string | null = null;

  /** URL of the `foxy-products.js` module. Only the link is offered without it. */
  script: string | null = null;

  /** URL of the page that sets the store's look. */
  lookHref: string | null = null;

  product: Data | null = null;

  /** The product's active variants. */
  variants: Data[] = [];

  /** The product's compiled modifiers. */
  modifiers: ProductModifier[] = [];

  private __kind: Kind = 'link';

  /** The SKU of the variant a link or a button adds. */
  private __variant = '';

  renderControl(): TemplateResult {
    const product = this.product;
    if (!product || !this.host) return html``;

    const isVariant = product.product_type === 'variant';
    // A variant has no page or form of its own: those are its parent's.
    const kinds: Kind[] = !this.script
      ? ['link']
      : isVariant
      ? ['link', 'button']
      : ['link', 'button', 'form', 'tile', 'page'];
    const kind = kinds.includes(this.__kind) ? this.__kind : 'link';
    const addsOneSku = kind === 'link' || kind === 'button';
    const needsVariant = addsOneSku && this.variants.length > 0;
    const hasOptions = !!(product.compiled_definition?.options ?? product.definition?.options)
      ?.length;
    const variant = this.variants.find(v => v.sku === this.__variant);
    const sku = needsVariant ? variant?.sku : product.sku;
    const cantAdd = addsOneSku && !this.variants.length && hasOptions && !isVariant;

    return html`
      <div class="grid gap-s" data-testid="storefront">
        <div role="radiogroup" aria-label=${this.t('kind_label')} class="flex flex-wrap">
          ${kinds.map(
            item => html`
              <button
                type="button"
                role="radio"
                class="text-s rounded-full border ${item === kind
                  ? 'border-primary bg-primary-10 text-primary font-medium'
                  : 'border-contrast-30'}"
                style="height: 2rem; padding: 0 0.75rem; margin: 0 0.375rem 0.375rem 0"
                data-testid="kind-${item}"
                aria-checked=${item === kind ? 'true' : 'false'}
                @click=${() => (this.__kind = item)}
              >
                ${this.t(`kind_${item}`)}
              </button>
            `
          )}
        </div>
        <p class="text-s text-secondary">${this.t(`hint_${kind}`)}</p>

        ${needsVariant
          ? html`
              <div class="grid gap-xs" style="max-width: 22rem">
                <label class="text-s text-secondary" for="variant">
                  ${this.t(kind === 'link' ? 'variant_label_link' : 'variant_label_button')}
                </label>
                <select
                  id="variant"
                  class="rounded-s border border-contrast-30 bg-base text-s"
                  style="height: 2.25rem; padding: 0 0.5rem"
                  data-testid="variant-select"
                  @change=${(evt: Event) =>
                    (this.__variant = (evt.currentTarget as HTMLSelectElement).value)}
                >
                  <option value="" ?selected=${!variant}>${this.t('variant_placeholder')}</option>
                  ${this.variants.map(
                    v => html`
                      <option value=${v.sku} ?selected=${v.sku === variant?.sku}>
                        ${[variantLabel(product, v), `(${v.sku})`].filter(Boolean).join(' ')}
                      </option>
                    `
                  )}
                </select>
              </div>
            `
          : ''}
        ${cantAdd
          ? html`<p class="text-s text-secondary" data-testid="storefront-no-variants">
              ${this.t('no_variants')}
            </p>`
          : !sku
          ? html`<p class="text-s text-secondary" data-testid="storefront-pick-variant">
              ${this.t('pick_variant')}
            </p>`
          : kind === 'link'
          ? html`
              <foxy-internal-product-form-cart-link-control
                infer="cart-link-builder"
                host=${this.host}
                sku=${sku}
                .options=${[]}
                .modifiers=${this.__modifiersOf(variant)}
              >
              </foxy-internal-product-form-cart-link-control>
            `
          : this.__renderSnippet(this.__snippet(kind, sku))}
        ${kind === 'link'
          ? ''
          : html`
              <p class="text-s text-secondary">
                ${this.t('look_note')}
                ${this.lookHref
                  ? html`·
                      <a class="text-primary font-medium" href=${this.lookHref}>
                        ${this.t('look_link')}
                      </a>`
                  : ''}
              </p>
            `}
      </div>
    `;
  }

  /** The chosen variant's modifiers, which may differ from its parent's. */
  private __modifiersOf(variant: Data | undefined): ProductModifier[] {
    const compiled = variant?.compiled_definition?.modifiers;
    if (!compiled) return this.modifiers;
    return compiled.filter(modifier => !isRemoval(modifier)) as ProductModifier[];
  }

  private __snippet(kind: Exclude<Kind, 'link'>, sku: string): string {
    const tag = TAGS[kind];
    const attributes = [
      `store="${escapeAttribute(this.host ?? '')}"`,
      `sku="${escapeAttribute(sku)}"`,
      kind === 'form' ? 'show-quantity' : '',
    ].filter(Boolean);
    return [
      `<script type="module" src="${escapeAttribute(this.script ?? '')}"></script>`,
      `<${tag} ${attributes.join(' ')}></${tag}>`,
    ].join('\n');
  }

  private __renderSnippet(code: string) {
    return html`
      <div class="flex items-start" style="gap: 0.625rem">
        <pre
          class="flex-1 min-w-0 m-0 rounded text-s"
          style="padding: 0.75rem 0.875rem; background: var(--lumo-contrast-90pct); color: var(--lumo-base-color); overflow-x: auto; white-space: pre; line-height: 1.6"
          data-testid="snippet"
        ><code>${code}</code></pre>
        <foxy-copy-to-clipboard infer="copy-code" layout="text" text=${code}>
        </foxy-copy-to-clipboard>
      </div>
    `;
  }
}
