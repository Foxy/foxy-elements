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
      __pattern: { attribute: false },
      __state: { attribute: false },
      __created: { attribute: false },
      __error: { attribute: false },
    };
  }

  private __pattern = '';

  private __state: 'idle' | 'busy' | 'done' | 'fail' = 'idle';

  private __created = 0;

  private __error = '';

  renderControl(): TemplateResult {
    const form = this.nucleon as ProductForm | null;
    const data = form?.data;
    const options = data?.definition?.options ?? [];
    const defaultPattern = defaultSkuPattern(options);
    const pattern = this.__pattern || defaultPattern;
    const locked = this.disabled || this.readonly || this.__state === 'busy';
    const count = combinationCount(options);

    return html`
      <div class="grid gap-s" data-testid="generate-variants">
        <div>
          <span class="text-l font-medium">${this.t('label')}</span>
          <p class="text-s text-secondary leading-s">
            ${this.t('helper_text', { count, limit: LIMITS.variants })}
          </p>
        </div>

        <vaadin-text-field
          class="w-full"
          data-testid="sku-pattern"
          label=${this.t('pattern_label')}
          helper-text=${this.t('pattern_helper_text', {
            pattern: defaultPattern,
            example: exampleSku(pattern, data?.sku ?? '', options),
          })}
          placeholder=${defaultPattern}
          ?disabled=${locked}
          .value=${this.__pattern}
          @input=${(evt: Event) => {
            this.__pattern = (evt.currentTarget as TextFieldElement).value.trim();
          }}
        >
        </vaadin-text-field>

        <div class="flex flex-wrap items-center" style="gap: 1rem">
          <vaadin-button
            theme="primary"
            data-testid="generate"
            ?disabled=${locked || form?.in({ idle: { snapshot: 'dirty' } })}
            @click=${() => this.__generate()}
          >
            ${this.t(this.__state === 'busy' ? 'button_busy' : 'button')}
          </vaadin-button>
          ${form?.in({ idle: { snapshot: 'dirty' } })
            ? html`<span class="text-s text-secondary">${this.t('save_first')}</span>`
            : this.__state === 'done'
            ? html`<span class="text-s text-success" data-testid="generate-result">
                ${this.t(this.__created ? 'created' : 'created_none', { count: this.__created })}
              </span>`
            : this.__state === 'fail'
            ? html`<span class="text-s text-error" data-testid="generate-result">
                ${this.__error || this.t('error')}
              </span>`
            : ''}
        </div>
      </div>
    `;
  }

  private async __generate() {
    const form = this.nucleon as ProductForm | null;
    if (!form) return;
    this.__state = 'busy';
    try {
      this.__created = await form.generateVariants(this.__pattern || undefined);
      this.__state = 'done';
    } catch (err) {
      this.__error = err instanceof Error ? err.message : '';
      this.__state = 'fail';
    }
  }
}
