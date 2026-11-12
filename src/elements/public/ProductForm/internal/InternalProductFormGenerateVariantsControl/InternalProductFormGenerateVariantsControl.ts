import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';
import type { ProductForm } from '../../ProductForm';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { LIMITS, combinationCount, defaultSkuPattern, exampleSku } from '../../catalog';
import { html } from 'lit-element';

/**
 * Creates a variant for every combination of the product's saved options that
 * doesn't have one yet, through `fx:generate_variants`.
 *
 * @element foxy-internal-product-form-generate-variants-control
 */
export class InternalProductFormGenerateVariantsControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      missing: { type: Number },
      __showPattern: { attribute: false },
      __pattern: { attribute: false },
      __state: { attribute: false },
      __error: { attribute: false },
    };
  }

  /** How many combinations of the saved options have no variant yet. */
  missing: number | null = null;

  private __showPattern = false;

  private __pattern = '';

  private __state: 'idle' | 'busy' | 'fail' = 'idle';

  private __error = '';

  renderControl(): TemplateResult {
    const form = this.nucleon as ProductForm | null;
    const data = form?.data;
    const options = data?.definition?.options ?? [];
    const defaultPattern = defaultSkuPattern(options);
    const pattern = this.__pattern || defaultPattern;
    const locked = this.disabled || this.readonly || this.__state === 'busy';
    const count = combinationCount(options);

    const dirty = !!form?.in({ idle: { snapshot: 'dirty' } });

    return html`
      <div
        class="flex flex-wrap items-center rounded"
        style="gap: 0.75rem; padding: 0.75rem 0.875rem; background: #fff6e5; color: #5e3b00"
        data-testid="generate-variants"
      >
        <p class="text-s" style="flex: 1 1 20rem" data-testid="generate-missing">
          ${this.t('missing', { count: this.missing ?? count, limit: LIMITS.variants })}
        </p>
        <button
          type="button"
          class="text-s text-primary"
          style="height: 2.125rem; padding: 0 0.75rem"
          data-testid="toggle-pattern"
          aria-expanded=${this.__showPattern ? 'true' : 'false'}
          @click=${() => (this.__showPattern = !this.__showPattern)}
        >
          ${this.t('pattern_toggle')}
        </button>
        <vaadin-button
          theme="primary small"
          data-testid="generate"
          ?disabled=${locked || dirty}
          @click=${() => this.__generate()}
        >
          ${this.t(this.__state === 'busy' ? 'button_busy' : 'button', {
            count: this.missing ?? count,
          })}
        </vaadin-button>

        <vaadin-text-field
          style="flex-basis: 100%; max-width: 30rem"
          data-testid="sku-pattern"
          label=${this.t('pattern_label')}
          helper-text=${this.t('pattern_helper_text', {
            pattern: defaultPattern,
            example: exampleSku(pattern, data?.sku ?? '', options),
          })}
          placeholder=${defaultPattern}
          ?hidden=${!this.__showPattern}
          ?disabled=${locked}
          .value=${this.__pattern}
          @input=${(evt: Event) => {
            this.__pattern = (evt.currentTarget as TextFieldElement).value.trim();
          }}
        >
        </vaadin-text-field>

        ${dirty
          ? html`<span class="text-s" style="flex-basis: 100%">${this.t('save_first')}</span>`
          : this.__state === 'fail'
          ? html`<span
              class="text-s text-error"
              style="flex-basis: 100%"
              data-testid="generate-result"
            >
              ${this.__error || this.t('error')}
            </span>`
          : ''}
      </div>
    `;
  }

  private async __generate() {
    const form = this.nucleon as ProductForm | null;
    if (!form) return;
    this.__state = 'busy';
    try {
      await form.generateVariants(this.__pattern || undefined);
      this.__state = 'idle';
    } catch (err) {
      this.__error = err instanceof Error ? err.message : '';
      this.__state = 'fail';
    }
  }
}
