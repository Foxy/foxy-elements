import type { ProductOption, ProductOptionValue } from '../../types';
import type { ProductForm } from '../../ProductForm';
import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { CatalogError } from '../../catalog';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { LIMITS, defaultSkuCode, validateOptions } from '../../catalog';
import { listActions, move, parseWeight, textField, withField } from '../fields';
import { html } from 'lit-element';

/**
 * A product's options: the choices that make its variants, such as colour and
 * size, each with its values in display order.
 *
 * @element foxy-internal-product-form-options-control
 */
export class InternalProductFormOptionsControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      modifierNames: { attribute: false },
      variantsToDelete: { attribute: false },
      deleteConfirmed: { type: Boolean, attribute: false },
    };
  }

  /** Names of the product's compiled modifiers, which an option can't share. */
  modifierNames: string[] = [];

  /** SKUs of the variants that saving would delete, because they use a removed value. */
  variantsToDelete: string[] = [];

  /** Whether the merchant agreed to delete them. */
  deleteConfirmed = false;

  renderControl(): TemplateResult {
    const options = this.__options;
    const locked = this.disabled || this.readonly;
    const errors = validateOptions(options, this.modifierNames);
    const error = (path: string) => {
      const found = errors.find((e: CatalogError) => e.path === path);
      return found ? this.t(found.code) : undefined;
    };

    return html`
      <div class="grid gap-m">
        <div>
          <span class="text-l font-medium">${this.t('label')}</span>
          <p class="text-s text-secondary leading-s">${this.t('helper_text')}</p>
          ${error('options')
            ? html`<p class="text-s text-error" data-testid="options-error">${error('options')}</p>`
            : ''}
        </div>

        ${this.variantsToDelete.length ? this.__renderDeleteWarning(locked) : ''}
        ${options.map((option, index) =>
          this.__renderOption(option, index, options.length, locked, error)
        )}

        <div>
          <vaadin-button
            data-testid="add-option"
            ?disabled=${locked || options.length >= LIMITS.options}
            @click=${() => this.__setOptions([...options, { name: '', values: [{ value: '' }] }])}
          >
            ${this.t('add_option')}
          </vaadin-button>
          ${options.length >= LIMITS.options
            ? html`<p class="text-s text-secondary">${this.t('limit_reached')}</p>`
            : ''}
        </div>
      </div>
    `;
  }

  private __renderDeleteWarning(locked: boolean) {
    const skus = this.variantsToDelete;
    const shown = skus.slice(0, 5).join(', ') + (skus.length > 5 ? ', …' : '');
    return html`
      <div
        class="grid gap-s rounded p-m bg-error-10 text-error"
        role="alert"
        data-testid="delete-warning"
      >
        <p class="text-s leading-s">
          ${this.t('delete_warning', { count: skus.length, skus: shown })}
        </p>
        <vaadin-checkbox
          data-testid="confirm-delete"
          ?disabled=${locked}
          .checked=${this.deleteConfirmed}
          @change=${(evt: Event) => {
            const checked = (evt.currentTarget as HTMLInputElement).checked;
            this.dispatchEvent(new CustomEvent('confirm-delete', { detail: checked }));
          }}
        >
          ${this.t('delete_confirm', { count: skus.length })}
        </vaadin-checkbox>
      </div>
    `;
  }

  private __renderOption(
    option: ProductOption,
    index: number,
    count: number,
    locked: boolean,
    error: (path: string) => string | undefined
  ) {
    const path = `options.${index}`;
    const values = option.values ?? [];
    const setOption = (changed: ProductOption) =>
      this.__setOptions(this.__options.map((v, i) => (i === index ? changed : v)));
    const setValue = (valueIndex: number, changed: ProductOptionValue) =>
      setOption({ ...option, values: values.map((v, i) => (i === valueIndex ? changed : v)) });

    return html`
      <div class="grid gap-s border border-contrast-10 rounded p-m" data-testid="option">
        <div
          class="grid gap-s"
          style="grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr))"
        >
          ${textField({
            label: this.t('name_label'),
            helperText: this.t('name_helper_text'),
            placeholder: 'color',
            value: option.name,
            error: error(`${path}.name`),
            locked,
            testid: 'option-name',
            onChange: name => setOption({ ...option, name }),
          })}
          ${textField({
            label: this.t('option_label_label'),
            helperText: this.t('option_label_helper_text'),
            placeholder: option.name || 'Colour',
            value: option.label,
            error: error(`${path}.label`),
            locked,
            testid: 'option-label',
            onChange: label => setOption(withField(option, 'label', label)),
          })}
        </div>

        <span class="font-medium">${this.t('values_label')}</span>
        ${error(`${path}.values`)
          ? html`<p class="text-s text-error">${error(`${path}.values`)}</p>`
          : ''}
        ${values.map((value, valueIndex) =>
          this.__renderValue(value, `${path}.values.${valueIndex}`, locked, error, {
            index: valueIndex,
            length: values.length,
            onChange: changed => setValue(valueIndex, changed),
            onMove: (from, to) => setOption({ ...option, values: move(values, from, to) }),
            onRemove: () =>
              setOption({ ...option, values: values.filter((_, i) => i !== valueIndex) }),
          })
        )}

        <div class="flex flex-wrap items-center justify-between" style="gap: 1rem">
          <button
            class="text-s font-medium text-primary"
            type="button"
            data-testid="add-value"
            ?disabled=${locked || values.length >= LIMITS.values}
            @click=${() => setOption({ ...option, values: [...values, { value: '' }] })}
          >
            ${this.t('add_value')}
          </button>
          ${listActions({
            index,
            length: count,
            locked,
            t: key => this.t(`${key}_option`),
            testid: 'option-actions',
            onMove: (from, to) => this.__setOptions(move(this.__options, from, to)),
            onRemove: () => this.__setOptions(this.__options.filter((_, i) => i !== index)),
          })}
        </div>
      </div>
    `;
  }

  private __renderValue(
    value: ProductOptionValue,
    path: string,
    locked: boolean,
    error: (path: string) => string | undefined,
    list: {
      index: number;
      length: number;
      onChange: (value: ProductOptionValue) => void;
      onMove: (from: number, to: number) => void;
      onRemove: () => void;
    }
  ) {
    const { onChange } = list;
    // Said once, on the first value, rather than on every one.
    const help = (key: string) => (list.index === 0 ? this.t(key) : undefined);
    const swatch = value.image?.src
      ? html`<img
          class="object-cover rounded-s flex-shrink-0"
          style="width: var(--lumo-size-m); height: var(--lumo-size-m)"
          src=${value.image.src}
          alt=""
        />`
      : value.color && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.color)
      ? html`<span
          class="block rounded-s flex-shrink-0 border border-contrast-10"
          style="width: var(--lumo-size-m); height: var(--lumo-size-m); background: ${value.color}"
        ></span>`
      : '';

    return html`
      <div class="grid gap-s border-t border-contrast-10 pt-s" data-testid="option-value">
        <div
          class="grid gap-s"
          style="grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr))"
        >
          ${textField({
            label: this.t('value_label'),
            helperText: help('value_helper_text'),
            placeholder: 'Black',
            value: value.value,
            error: error(`${path}.value`),
            locked,
            testid: 'value-value',
            onChange: changed => onChange({ ...value, value: changed }),
          })}
          ${textField({
            label: this.t('value_display_label'),
            helperText: help('value_display_helper_text'),
            placeholder: value.value,
            value: value.label,
            error: error(`${path}.label`),
            locked,
            testid: 'value-label',
            onChange: label => onChange(withField(value, 'label', label)),
          })}
          ${textField({
            label: this.t('sku_code_label'),
            helperText: help('sku_code_helper_text'),
            placeholder: value.value ? defaultSkuCode(value.value) : '',
            value: value.sku_code,
            error: error(`${path}.sku_code`),
            locked,
            testid: 'value-sku-code',
            onChange: code => onChange(withField(value, 'sku_code', code)),
          })}
          ${textField({
            label: this.t('price_mod_label'),
            helperText: help('price_mod_helper_text'),
            placeholder: '0.00',
            value: value.price_mod,
            error: error(`${path}.price_mod`),
            locked,
            testid: 'value-price-mod',
            onChange: amount => onChange(withField(value, 'price_mod', amount)),
          })}
          ${textField({
            label: this.t('weight_mod_label'),
            helperText: help('weight_mod_helper_text'),
            placeholder: '0',
            value: value.weight_mod,
            error: error(`${path}.weight_mod`),
            locked,
            testid: 'value-weight-mod',
            onChange: weight => onChange(withField(value, 'weight_mod', parseWeight(weight))),
          })}
          <div class="flex items-start" style="gap: 0.5rem">
            ${textField({
              label: this.t('color_label'),
              helperText: help('color_helper_text'),
              placeholder: '#1d1d1f',
              value: value.color,
              error: error(`${path}.color`),
              locked,
              testid: 'value-color',
              className: 'flex-1 min-w-0',
              onChange: color => onChange(withField(value, 'color', color)),
            })}
            <div style="padding-top: var(--lumo-space-l)">${swatch}</div>
          </div>
        </div>
        <div
          class="grid gap-s"
          style="grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr))"
        >
          ${textField({
            label: this.t('image_label'),
            helperText: help('image_helper_text'),
            placeholder: 'https://',
            value: value.image?.src,
            error: error(`${path}.image`),
            locked,
            testid: 'value-image',
            onChange: src =>
              onChange(withField(value, 'image', src ? { ...value.image, src } : undefined)),
          })}
          ${textField({
            label: this.t('image_alt_label'),
            value: value.image?.alt,
            locked: locked || !value.image?.src,
            testid: 'value-image-alt',
            onChange: alt =>
              value.image && onChange({ ...value, image: withField(value.image, 'alt', alt) }),
          })}
        </div>
        ${listActions({
          index: list.index,
          length: list.length,
          locked,
          t: key => this.t(key),
          testid: 'value-actions',
          onMove: list.onMove,
          onRemove: list.onRemove,
        })}
      </div>
    `;
  }

  private get __options(): ProductOption[] {
    const form = this.nucleon as ProductForm | null;
    return form?.form.definition?.options ?? [];
  }

  private __setOptions(options: ProductOption[]) {
    const form = this.nucleon as ProductForm | null;
    if (!form) return;
    const definition = { ...form.form.definition };
    if (options.length) definition.options = options;
    else delete definition.options;
    form.edit({ definition });
  }
}
