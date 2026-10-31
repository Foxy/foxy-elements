import type { ProductModifier, ProductOption } from '../../types';
import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import type { TextFieldElement } from '@vaadin/vaadin-text-field';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { LIMITS, buildCartLink } from '../../catalog';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

/**
 * Builds an add-to-cart link for a product the shopper makes choices for: a
 * parent's options, which pick the variant, and the product's modifiers.
 *
 * @element foxy-internal-product-form-cart-link-control
 */
export class InternalProductFormCartLinkControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      host: {},
      sku: {},
      options: { attribute: false },
      modifiers: { attribute: false },
      __choices: { attribute: false },
    };
  }

  /** The store's host, such as `example.foxycart.com`. */
  host: string | null = null;

  sku: string | null = null;

  /** A parent's options, whose values pick the variant. */
  options: ProductOption[] = [];

  /** The product's compiled modifiers. */
  modifiers: ProductModifier[] = [];

  private __choices: Record<string, string> = {};

  /** The link for the current choices, or `undefined` while a required choice is missing. */
  get link(): string | undefined {
    if (!this.host || !this.sku) return;
    const params: [string, string][] = [];
    for (const option of this.options) {
      const value = this.__choices[option.name];
      if (!value) return;
      params.push([option.name, value]);
    }
    for (const modifier of this.modifiers) {
      const value = (this.__choices[modifier.name] ?? '').trim();
      if (!value && modifier.required) return;
      if (value) params.push([modifier.name, value]);
    }
    return buildCartLink(this.host, this.sku, params);
  }

  renderControl(): TemplateResult {
    const link = this.link;

    return html`
      <div class="grid gap-s" data-testid="cart-link-builder">
        <div>
          <span class="text-l font-medium">${this.t('label')}</span>
          <p class="text-s text-secondary leading-s">${this.t('helper_text')}</p>
        </div>

        <div
          class="grid gap-s"
          style="grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr))"
        >
          ${this.options.map(option =>
            this.__renderSelect(
              option.name,
              option.label || option.name,
              option.values.map(v => ({ label: v.label || v.value, value: v.value })),
              true
            )
          )}
          ${this.modifiers.map(modifier =>
            modifier.type === 'select'
              ? this.__renderSelect(
                  modifier.name,
                  modifier.label || modifier.name,
                  (modifier.values ?? []).map(v => ({ label: v.label || v.value, value: v.value })),
                  !!modifier.required
                )
              : html`
                  <vaadin-text-field
                    data-testid="choice-${modifier.name}"
                    label=${modifier.label || modifier.name}
                    helper-text=${modifier.required ? this.t('required') : this.t('optional')}
                    maxlength=${modifier.max_length ?? LIMITS.maxLengthDefault}
                    .value=${this.__choices[modifier.name] ?? ''}
                    @input=${(evt: Event) =>
                      this.__choose(modifier.name, (evt.currentTarget as TextFieldElement).value)}
                  >
                  </vaadin-text-field>
                `
          )}
        </div>

        ${link
          ? html`
              <div class="flex items-center justify-between gap-m" data-testid="cart-link">
                <span class="block text-s text-secondary min-w-0" style="word-break: break-all">
                  ${link}
                </span>
                <foxy-copy-to-clipboard infer="copy" layout="text" text=${link}>
                </foxy-copy-to-clipboard>
              </div>
            `
          : html`<p class="text-s text-secondary" data-testid="cart-link-incomplete">
              ${this.t('incomplete')}
            </p>`}
      </div>
    `;
  }

  private __renderSelect(
    name: string,
    label: string,
    items: { label: string; value: string }[],
    required: boolean
  ) {
    return html`
      <vaadin-combo-box
        data-testid="choice-${name}"
        label=${label}
        helper-text=${required ? this.t('required') : this.t('optional')}
        item-label-path="label"
        item-value-path="value"
        clear-button-visible
        placeholder=${ifDefined(required ? undefined : this.t('leave_out'))}
        .items=${items}
        .value=${this.__choices[name] ?? ''}
        @change=${(evt: Event) => this.__choose(name, (evt.currentTarget as ComboBoxElement).value)}
      >
      </vaadin-combo-box>
    `;
  }

  private __choose(name: string, value: string) {
    this.__choices = { ...this.__choices, [name]: value };
  }
}
