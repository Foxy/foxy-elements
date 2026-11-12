import type { Data, ProductOption, ProductOptionValue } from '../../types';
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
      savedOptions: { attribute: false },
      variants: { attribute: false },
      __managed: { attribute: false },
    };
  }

  /** Names of the product's compiled modifiers, which an option can't share. */
  modifierNames: string[] = [];

  /** The options as saved, to tell which values an edit removes. */
  savedOptions: ProductOption[] = [];

  /** The product's active variants, to tell how many use each value. */
  variants: Data[] = [];

  /** Whether each option's editor is open, by name, where the merchant chose. */
  private __managed: Record<string, boolean> = {};

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
          <h3 class="text-m font-semibold">${this.t('label')}</h3>
          ${error('options')
            ? html`<p class="text-s text-error" data-testid="options-error">${error('options')}</p>`
            : ''}
        </div>

        ${options.map((option, index) =>
          this.__renderOption(option, index, options.length, locked, error, errors)
        )}
        ${this.__renderRemovedOptions(options, locked)}

        <div>
          <vaadin-button
            data-testid="add-option"
            ?disabled=${locked || options.length >= LIMITS.options || this.variants.length > 0}
            @click=${() => this.__setOptions([...options, { name: '', values: [{ value: '' }] }])}
          >
            ${this.t('add_option')}
          </vaadin-button>
          <span
            class="text-s text-secondary"
            style="margin-left: 0.5rem"
            data-testid="options-used"
          >
            ${this.t('used', { count: options.length, limit: LIMITS.options })}
          </span>
          ${options.length >= LIMITS.options
            ? html`<p class="text-s text-secondary">${this.t('limit_reached')}</p>`
            : this.variants.length > 0
            ? html`<p class="text-s text-secondary" data-testid="options-locked">
                ${this.t('has_variants')}
              </p>`
            : ''}
        </div>
      </div>
    `;
  }

  /** How many active variants have this value for this option. */
  private __usedBy(option: string, value: string): number {
    const wanted = value.toLowerCase();
    return this.variants.filter(v => v.option_values?.[option]?.toLowerCase() === wanted).length;
  }

  /** A saved option the edit removes altogether, with the variants that go with it. */
  private __renderRemovedOptions(options: ProductOption[], locked: boolean) {
    const removed = this.savedOptions.filter(saved => !options.some(o => o.name === saved.name));
    return removed.map(option => {
      const used = this.variants.filter(v => v.option_values?.[option.name] !== undefined).length;
      return html`
        <div
          class="flex flex-wrap items-center rounded p-m bg-error-10 text-s"
          style="gap: 0.75rem"
          data-testid="removed-option"
        >
          <span class="flex-1" style="text-decoration: line-through">
            ${option.label || option.name}
          </span>
          <span class="text-error">
            ${used ? this.t('removed_used', { count: used }) : this.t('removed_unused')}
          </span>
          <button
            class="text-primary font-medium"
            type="button"
            data-testid="undo-option"
            ?disabled=${locked || options.length >= LIMITS.options}
            @click=${() => {
              const index = this.savedOptions.indexOf(option);
              const restored = [...options];
              restored.splice(Math.min(index, restored.length), 0, option);
              this.__setOptions(restored);
            }}
          >
            ${this.t('undo')}
          </button>
        </div>
      `;
    });
  }

  private __renderOption(
    option: ProductOption,
    index: number,
    count: number,
    locked: boolean,
    error: (path: string) => string | undefined,
    errors: CatalogError[]
  ) {
    const path = `options.${index}`;
    const values = option.values ?? [];
    const saved = this.savedOptions.find(o => o.name === option.name);
    const removedValues = (saved?.values ?? []).filter(
      v => !values.some(kept => kept.value.toLowerCase() === v.value.toLowerCase())
    );
    // A new option, or one with a mistake in it, opens by itself.
    const managed =
      this.__managed[option.name] ?? (!saved || errors.some(e => e.path.startsWith(path)));
    const swatch = (value: ProductOptionValue) =>
      value.color && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value.color)
        ? html`<span
            class="inline-block rounded-full flex-shrink-0"
            style="width: 0.75rem; height: 0.75rem; box-shadow: inset 0 0 0 1px rgba(0,0,0,0.2); background: ${value.color}"
          ></span>`
        : '';
    return html`
      <div
        class="grid gap-s border rounded p-m ${managed ? 'border-primary' : 'border-contrast-10'}"
        data-testid="option"
      >
        <div class="flex flex-wrap items-center" style="gap: 0.75rem">
          <span class="font-semibold" style="min-width: 5.5rem" data-testid="option-title">
            ${option.label || option.name || this.t('new_option')}
          </span>
          <div class="flex flex-wrap flex-1" style="gap: 0.375rem; min-width: 12rem">
            ${values
              .filter(value => value.value)
              .map(
                value => html`
                  <span
                    class="inline-flex items-center rounded-full bg-contrast-10 text-s"
                    style="gap: 0.375rem; height: 1.625rem; padding: 0 0.625rem"
                    data-testid="value-chip"
                  >
                    ${swatch(value)}${value.label || value.value}
                  </span>
                `
              )}
          </div>
          <button
            class="text-s rounded-s ${managed
              ? 'bg-primary-10 text-primary'
              : 'bg-contrast-10 text-body'}"
            style="height: 2rem; padding: 0 0.625rem"
            type="button"
            data-testid="manage-option"
            aria-expanded=${managed ? 'true' : 'false'}
            aria-label=${this.t('manage_option', { option: option.label || option.name })}
            @click=${() => (this.__managed = { ...this.__managed, [option.name]: !managed })}
          >
            ${this.t(managed ? 'done' : 'manage')}
          </button>
        </div>

        ${managed
          ? this.__renderOptionEditor(option, index, count, locked, error, removedValues)
          : removedValues.length
          ? html`<p class="text-s text-error" data-testid="removed-values-note">
              ${this.t('removed_values', {
                count: removedValues.length,
                values: removedValues.map(v => v.label || v.value).join(', '),
              })}
            </p>`
          : ''}
      </div>
    `;
  }

  private __renderOptionEditor(
    option: ProductOption,
    index: number,
    count: number,
    locked: boolean,
    error: (path: string) => string | undefined,
    removedValues: ProductOptionValue[]
  ) {
    const path = `options.${index}`;
    const values = option.values ?? [];
    const saved = this.savedOptions.find(o => o.name === option.name);
    const setOption = (changed: ProductOption) => {
      // The editor stays open under the option's new name.
      if (changed.name !== option.name && option.name in this.__managed) {
        this.__managed = { ...this.__managed, [changed.name]: this.__managed[option.name] };
      }
      this.__setOptions(this.__options.map((v, i) => (i === index ? changed : v)));
    };
    const setValue = (valueIndex: number, changed: ProductOptionValue) =>
      setOption({ ...option, values: values.map((v, i) => (i === valueIndex ? changed : v)) });

    return html`
      <div class="grid gap-s border-t border-contrast-10 pt-s" data-testid="option-editor">
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
            usedBy: saved && value.value ? this.__usedBy(option.name, value.value) : null,
            index: valueIndex,
            length: values.length,
            onChange: changed => setValue(valueIndex, changed),
            onMove: (from, to) => setOption({ ...option, values: move(values, from, to) }),
            onRemove: () =>
              setOption({ ...option, values: values.filter((_, i) => i !== valueIndex) }),
          })
        )}
        ${removedValues.map(value => {
          const used = this.__usedBy(option.name, value.value);
          return html`
            <div
              class="flex flex-wrap items-center rounded p-s bg-error-10 text-s"
              style="gap: 0.75rem"
              data-testid="removed-value"
            >
              <span class="flex-1" style="text-decoration: line-through">
                ${value.label || value.value}
              </span>
              <span class="text-error">
                ${used ? this.t('removed_used', { count: used }) : this.t('removed_unused')}
              </span>
              <button
                class="text-primary font-medium"
                type="button"
                data-testid="undo-value"
                ?disabled=${locked || values.length >= LIMITS.values}
                @click=${() => {
                  const at = saved?.values.indexOf(value) ?? values.length;
                  const restored = [...values];
                  restored.splice(Math.min(at, restored.length), 0, value);
                  setOption({ ...option, values: restored });
                }}
              >
                ${this.t('undo')}
              </button>
            </div>
          `;
        })}

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
      usedBy: number | null;
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
        ${list.usedBy === null
          ? ''
          : html`<span class="text-s text-secondary" data-testid="value-used-by">
              ${list.usedBy ? this.t('used_by', { count: list.usedBy }) : this.t('used_by_none')}
            </span>`}
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
