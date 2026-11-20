import type { CSSResultArray, TemplateResult } from 'lit-element';
import type { Data, ProductOption } from '../../types';
import type { ProductForm } from '../../ProductForm';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { css, html } from 'lit-element';
import { previewFallback, previewSrc } from '../fields';

/**
 * A product's active variants as a table, with each one's price and stock
 * edited in place. Edits are kept by the form and saved with the product.
 *
 * @element foxy-internal-product-form-variants-control
 */
export class InternalProductFormVariantsControl extends InternalControl {
  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        table {
          border-collapse: collapse;
          width: 100%;
          min-width: 40rem;
          font-size: var(--lumo-font-size-s);
        }

        th,
        td {
          padding: 0.375rem 0.75rem;
          text-align: left;
        }

        th {
          padding-top: 0.5625rem;
          padding-bottom: 0.5625rem;
          font-weight: 600;
          background: var(--lumo-contrast-5pct);
        }

        tbody tr {
          border-top: 1px solid var(--lumo-contrast-10pct);
        }

        tr.deleting {
          background: var(--lumo-error-color-10pct);
        }

        tr.deleting .struck {
          text-decoration: line-through;
        }

        tr.changed {
          background: #fffbf0;
        }

        input {
          box-sizing: border-box;
          width: 100%;
          height: 2rem;
          padding: 0 0.5rem;
          border: 1px solid var(--lumo-contrast-20pct);
          border-radius: var(--lumo-border-radius-s);
          background: var(--lumo-base-color);
          color: inherit;
          font: inherit;
        }

        input[aria-invalid='true'] {
          border-color: var(--lumo-error-color);
        }

        img {
          display: block;
          width: 2.25rem;
          height: 2.25rem;
          object-fit: cover;
          border-radius: var(--lumo-border-radius-s);
          background: var(--lumo-contrast-10pct);
        }

        .sku {
          font-family: ui-monospace, Menlo, monospace;
          color: var(--lumo-primary-text-color);
          text-decoration: underline;
          text-align: left;
          overflow-wrap: anywhere;
        }

        button:focus-visible {
          outline: 2px solid var(--lumo-primary-color-50pct);
          outline-offset: 1px;
        }
      `,
    ];
  }

  renderControl(): TemplateResult {
    const form = this.nucleon as ProductForm | null;
    const variants = form?.variants ?? [];
    const options = form?.savedOptions ?? [];
    const locked = this.disabled || this.readonly;
    const deleting = new Set((form?.variantsToDelete ?? []).map(v => v._links.self.href));

    return html`
      <div class="grid gap-s" data-testid="variants">
        <div class="flex items-baseline justify-between" style="gap: 0.75rem">
          <h3 class="text-m font-semibold">${this.t('label')}</h3>
          <span class="text-s text-secondary" data-testid="variants-count">
            ${this.t('count', { count: variants.length })}
          </span>
        </div>

        ${typeof form?.generatedCount === 'number'
          ? html`<p
              class="rounded text-s"
              style="padding: 0.625rem 0.875rem; background: var(--lumo-success-color-10pct)"
              role="status"
              data-testid="variants-created"
            >
              ${this.t(form.generatedCount ? 'created' : 'created_none', {
                count: form.generatedCount,
              })}
            </p>`
          : ''}
        ${form?.variantError
          ? html`<p class="text-s text-error" role="alert" data-testid="variants-error">
              ${form.variantError}
            </p>`
          : ''}
        ${variants.length
          ? html`
              <div class="border border-contrast-10 rounded" style="overflow-x: auto">
                <table>
                  <thead>
                    <tr>
                      <th style="width: 3.75rem">
                        <span class="sr-only">${this.t('image')}</span>
                      </th>
                      <th>${this.t('sku')}</th>
                      ${options.map(option => html`<th>${option.label || option.name}</th>`)}
                      <th style="width: 9.5rem">${this.t('price')}</th>
                      <th style="width: 7rem">${this.t('stock')}</th>
                      <th style="width: 2.5rem">
                        <span class="sr-only">${this.t('actions')}</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    ${variants.map(variant =>
                      this.__renderRow(form!, variant, options, deleting, locked)
                    )}
                  </tbody>
                </table>
              </div>
            `
          : html`<p class="text-s text-secondary" data-testid="variants-empty">
              ${this.t(options.length ? 'empty' : 'empty_no_options')}
            </p>`}
      </div>
    `;
  }

  private __renderRow(
    form: ProductForm,
    variant: Data,
    options: ProductOption[],
    deleting: Set<string>,
    locked: boolean
  ) {
    const href = variant._links.self.href;
    const edit = form.variantEdits[href] ?? {};
    const errors = form.variantEditErrors(variant);
    const isDeleting = deleting.has(href);
    const sku = edit.sku ?? variant.sku;
    const inherited = form.data?.compiled_definition?.price ?? form.data?.definition?.price;
    const image =
      variant.definition?.images?.[0] ??
      variant.compiled_definition?.images?.[0] ??
      form.data?.compiled_definition?.images?.[0];
    const changed = !isDeleting && Object.keys(edit).some(key => key !== 'delete');
    const disabled = locked || isDeleting;

    return html`
      <tr
        class=${isDeleting ? 'deleting' : changed ? 'changed' : ''}
        data-testid="variant"
        data-sku=${variant.sku}
      >
        <td>
          <img
            src=${previewSrc(image?.src, form.getThumbnailUrl)}
            alt=""
            data-testid="variant-image"
            @error=${previewFallback(image?.src)}
          />
        </td>
        <td>
          <button
            type="button"
            class="sku struck"
            data-testid="variant-open"
            aria-label=${this.t('edit_variant', { sku })}
            @click=${() => form.openVariantPanel(href)}
          >
            ${sku}
          </button>
          ${isDeleting
            ? html`<span class="text-xs font-semibold text-error" data-testid="variant-deleting">
                ${this.t('deleted_on_save')}
                ${edit.delete
                  ? html`<button
                      type="button"
                      class="text-primary"
                      style="text-decoration: underline; margin-left: 0.25rem"
                      data-testid="variant-undo"
                      @click=${() => form.editVariant(href, { delete: undefined })}
                    >
                      ${this.t('undo')}
                    </button>`
                  : ''}
              </span>`
            : ''}
        </td>
        ${options.map(option => {
          const stored = variant.option_values?.[option.name];
          const value = option.values.find(v => v.value.toLowerCase() === stored?.toLowerCase());
          return html`<td class="struck">${value?.label || value?.value || stored || '—'}</td>`;
        })}
        <td>
          <input
            data-testid="variant-price"
            inputmode="decimal"
            aria-label=${this.t('price_for', { sku })}
            aria-invalid=${errors.price ? 'true' : 'false'}
            placeholder=${inherited !== undefined && inherited !== null && inherited !== ''
              ? this.t('price_inherited', { price: inherited })
              : ''}
            ?disabled=${disabled}
            .value=${edit.price ?? String(variant.definition?.price ?? '')}
            @input=${(evt: Event) =>
              form.editVariant(href, { price: (evt.currentTarget as HTMLInputElement).value })}
          />
        </td>
        <td>
          <input
            data-testid="variant-stock"
            type="number"
            inputmode="numeric"
            min="0"
            step="1"
            aria-label=${this.t('stock_for', { sku })}
            aria-invalid=${errors.stock ? 'true' : 'false'}
            placeholder=${this.t('stock_untracked')}
            ?disabled=${disabled}
            .value=${edit.stock ?? String(variant.stock_level ?? '')}
            @input=${(evt: Event) =>
              form.editVariant(href, { stock: (evt.currentTarget as HTMLInputElement).value })}
          />
        </td>
        <td>
          <button
            type="button"
            class="rounded-s"
            style="width: 1.875rem; height: 1.875rem"
            data-testid="variant-more"
            aria-label=${this.t('more_for', { sku })}
            @click=${() => form.openVariantPanel(href)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <circle cx="3.5" cy="8" r="1.3"></circle>
              <circle cx="8" cy="8" r="1.3"></circle>
              <circle cx="12.5" cy="8" r="1.3"></circle>
            </svg>
          </button>
        </td>
      </tr>
    `;
  }
}
