import type { Data, ProductOption, ProductOptionValue } from '../../types';
import type { ProductForm } from '../../ProductForm';
import type { CSSResultArray, LitElement, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { InternalColorPicker } from '../../../../internal/InternalColorPicker/InternalColorPicker';
import type { CatalogError } from '../../catalog';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import {
  ImageTooLargeError,
  LIMITS,
  defaultSkuCode,
  isImageUrl,
  validateOptions,
} from '../../catalog';
import { rowStyles } from '../styles';
import { html } from 'lit-element';
import {
  ACCEPTED_IMAGE_TYPES,
  amountSummary,
  disclosure,
  iconButton,
  isShown,
  leftField,
  listActions,
  move,
  parseWeight,
  previewFallback,
  previewSrc,
  rowErrors,
  rowField,
  textField,
  urlField,
  withField,
} from '../fields';

const VALUE_COLUMNS = 'minmax(0, 1.3fr) minmax(0, 1.3fr) minmax(0, 0.9fr) 5.25rem';

/**
 * A product's options: the choices that make its variants, such as color and
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
      __amountsOpen: { attribute: false },
      __uploading: { attribute: false },
      __urlFor: { attribute: false },
      __urlError: { attribute: false },
      __uploadError: { attribute: false },
      __managed: { attribute: false },
      __shown: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [...super.styles, rowStyles];
  }

  /** Names of the product's compiled modifiers, which an option can't share. */
  modifierNames: string[] = [];

  /** The options as saved, to tell which values an edit removes. */
  savedOptions: ProductOption[] = [];

  /** The product's active variants, to tell how many use each value. */
  variants: Data[] = [];

  /** What the merchant is done with, whose mistakes show: see `isShown`. */
  private __shown: string[] = [];

  /** Whether each option's editor is open, by name, where the merchant chose. */
  private __managed: Record<string, boolean> = {};

  /** Whether a value's price and weight fields are open, by the value's path. */
  private __amountsOpen: Record<string, boolean> = {};

  /** The path of the value whose image is uploading, and of the one whose upload failed. */
  private __uploading = '';

  private __uploadError = '';

  private __uploadTooLarge = false;

  /** The path of the value whose image is being given by URL, and why its URL was refused. */
  private __urlFor = '';

  private __urlError = '';

  /** What takes focus once a URL field opens or closes: a value's path and the control's test id. */
  private __focusNext: [string, string] | null = null;

  renderControl(): TemplateResult {
    const options = this.__options;
    const locked = this.disabled || this.readonly;
    const errors = validateOptions(options, this.modifierNames);
    const error = (path: string) => {
      const found = errors.find((e: CatalogError) => e.path === path);
      if (!found) return undefined;
      // A wrong value shows at once; a missing one only once the merchant is done with it.
      const missing = found.code.endsWith('_required');
      return missing && !isShown(path, this.__shown) ? undefined : this.t(found.code);
    };

    return html`
      <div class="grid gap-m" @focusout=${this.__handleFocusOut}>
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
            @mousedown=${(evt: Event) => evt.preventDefault()}
            @click=${() => {
              this.__commitField();
              this.__setOptions([...this.__options, { name: '', values: [{ value: '' }] }]);
            }}
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

  /** Shows the mistakes of every option, as a save does. */
  reportValidity(): void {
    this.__shown = [''];
  }

  private readonly __handleFocusOut = (evt: Event) => {
    const path = leftField(evt);
    if (path && !isShown(path, this.__shown)) this.__shown = [...this.__shown, path];
  };

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
          <span
            class="${managed ? 'text-l' : ''} font-semibold"
            style="min-width: 5.5rem"
            data-testid="option-title"
          >
            ${option.label || option.name || this.t('new_option')}
          </span>
          <div class="flex flex-wrap flex-1" style="gap: 0.375rem; min-width: 12rem">
            ${values
              .filter(value => value.value)
              .map(
                value => html`
                  <span
                    class="inline-flex items-center rounded-s bg-contrast-10 text-s"
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
            @click=${() => {
              // Done with mistakes in it shows them, and stays open to fix them.
              if (managed && errors.some(e => e.path.startsWith(`${path}.`))) {
                this.__shown = [...this.__shown, path];
              } else {
                this.__managed = { ...this.__managed, [option.name]: !managed };
              }
            }}
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
      <div class="grid gap-m border-t border-contrast-10 pt-m" data-testid="option-editor">
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
            path: `${path}.name`,
            locked,
            testid: 'option-name',
            onChange: name => setOption({ ...option, name }),
          })}
          ${textField({
            label: this.t('option_label_label'),
            helperText: this.t('option_label_helper_text'),
            placeholder: option.name || 'Color',
            value: option.label,
            error: error(`${path}.label`),
            path: `${path}.label`,
            locked,
            testid: 'option-label',
            onChange: label => setOption(withField(option, 'label', label)),
          })}
        </div>

        <div class="grid gap-s">
          <div>
            <h4 class="font-semibold">${this.t('values_label')}</h4>
            <p class="text-xs text-secondary">${this.t('values_helper_text')}</p>
          </div>
          ${error(`${path}.values`)
            ? html`<p class="text-s text-error">${error(`${path}.values`)}</p>`
            : ''}
          <div class="pd-values">
            <div class="pd-value-head" style="--pd-columns: ${VALUE_COLUMNS}" aria-hidden="true">
              <span>${this.t('value_label')}</span>
              <span>${this.t('value_display_label')}</span>
              <span>${this.t('sku_code_label')}</span>
            </div>
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
          </div>
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
          <div>
            <button
              class="text-s font-medium rounded-s bg-primary-10 text-primary"
              style="height: 2rem; padding: 0 0.625rem"
              type="button"
              data-testid="add-value"
              ?disabled=${locked || values.length >= LIMITS.values}
              @mousedown=${(evt: Event) => evt.preventDefault()}
              @click=${() => this.__addValue(index)}
            >
              ${this.t('add_value')}
            </button>
          </div>
        </div>

        <div class="flex justify-end border-t border-contrast-10 pt-s">
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
    const form = this.nucleon as ProductForm | null;
    const canUpload = !!form?.data?._links['fx:create_upload_url'] && !locked;
    const name = value.label || value.value || this.t('new_value');
    const amountErrors = [error(`${path}.price_mod`), error(`${path}.weight_mod`)];
    const amountsOpen = this.__amountsOpen[path] ?? amountErrors.some(Boolean);
    const uploading = this.__uploading === path;
    const byUrl = this.__urlFor === path && !locked;

    return html`
      <div class="pd-value" data-testid="option-value" data-path=${path}>
        <div class="pd-value-main" style="--pd-columns: ${VALUE_COLUMNS}">
          ${rowField({
            label: this.t('value_label'),
            placeholder: 'Black',
            value: value.value,
            error: error(`${path}.value`),
            path: `${path}.value`,
            locked,
            testid: 'value-value',
            onChange: changed => onChange({ ...value, value: changed }),
          })}
          ${rowField({
            label: this.t('value_display_label'),
            placeholder: value.value,
            value: value.label,
            error: error(`${path}.label`),
            path: `${path}.label`,
            locked,
            testid: 'value-label',
            onChange: label => onChange(withField(value, 'label', label)),
          })}
          ${rowField({
            label: this.t('sku_code_label'),
            placeholder: value.value ? defaultSkuCode(value.value) : '',
            value: value.sku_code,
            error: error(`${path}.sku_code`),
            path: `${path}.sku_code`,
            locked,
            mono: true,
            testid: 'value-sku-code',
            onChange: code => onChange(withField(value, 'sku_code', code)),
          })}
          ${listActions({
            index: list.index,
            length: list.length,
            locked,
            icons: true,
            t: key => this.t(key),
            testid: 'value-actions',
            onMove: list.onMove,
            onRemove: list.onRemove,
          })}
        </div>
        ${rowErrors([
          [this.t('value_label'), error(`${path}.value`)],
          [this.t('value_display_label'), error(`${path}.label`)],
          [this.t('sku_code_label'), error(`${path}.sku_code`)],
          [this.t('color_label'), error(`${path}.color`)],
          [this.t('image_label'), error(`${path}.image`)],
        ])}

        <div class="pd-value-extra">
          <div
            class="pd-appearance"
            role="group"
            aria-label=${this.t('appearance_label', { value: name })}
            data-testid="value-appearance"
          >
            <span class="text-secondary">${this.t('appearance')}</span>
            <foxy-internal-color-picker
              infer="swatch-color"
              data-testid="value-color"
              .label=${this.t('color_label')}
              .value=${value.color ?? ''}
              @change=${(evt: Event) =>
                onChange(
                  withField(value, 'color', (evt.currentTarget as InternalColorPicker).value)
                )}
            >
            </foxy-internal-color-picker>

            ${value.image?.src
              ? html`<img
                  class="pd-swatch-image"
                  src=${previewSrc(value.image.src, form?.getThumbnailUrl)}
                  alt=""
                  @error=${previewFallback(value.image.src)}
                />`
              : ''}
            ${byUrl
              ? urlField({
                  label: this.t('image_url_label'),
                  addLabel: this.t('image_url_add'),
                  error: this.__urlError,
                  testid: 'value-image-url',
                  onAdd: src => {
                    if (!isImageUrl(src)) {
                      this.__urlError = this.t('image_url_invalid');
                      return;
                    }
                    onChange({ ...value, image: { ...value.image, src } });
                    this.__toggleUrl(path, false);
                  },
                  onCancel: () => this.__toggleUrl(path, false),
                })
              : html`<label
                  class="pd-file"
                  data-testid="value-image-upload"
                  aria-disabled=${canUpload ? 'false' : 'true'}
                  title=${canUpload || locked ? '' : this.t('image_save_first')}
                >
                  ${uploading
                    ? this.t('image_uploading')
                    : this.t(value.image?.src ? 'image_replace' : 'image_upload')}
                  <input
                    class="sr-only"
                    type="file"
                    accept=${ACCEPTED_IMAGE_TYPES}
                    aria-label=${this.t('image_label')}
                    ?disabled=${!canUpload || uploading}
                    @change=${(evt: Event) => this.__uploadImage(evt, path)}
                  />
                </label>`}
            ${iconButton({
              icon: 'link',
              label: this.t('image_by_url'),
              testid: 'value-image-by-url',
              disabled: locked,
              pressed: byUrl,
              onClick: () => this.__toggleUrl(path, !byUrl),
            })}
            ${value.image?.src
              ? html`
                  ${iconButton({
                    icon: 'remove',
                    label: this.t('image_remove'),
                    testid: 'value-image-remove',
                    disabled: locked,
                    danger: true,
                    onClick: () => onChange(withField(value, 'image', undefined)),
                  })}
                  <span style="flex: 1 1 8rem; max-width: 16rem">
                    ${rowField({
                      label: this.t('image_alt_label'),
                      placeholder: this.t('image_alt_label'),
                      value: value.image.alt,
                      locked,
                      testid: 'value-image-alt',
                      onChange: alt =>
                        value.image &&
                        onChange({ ...value, image: withField(value.image, 'alt', alt) }),
                    })}
                  </span>
                `
              : ''}
          </div>

          ${list.usedBy === null
            ? ''
            : html`<span class="text-secondary" data-testid="value-used-by">
                ${list.usedBy ? this.t('used_by', { count: list.usedBy }) : this.t('used_by_none')}
              </span>`}
          ${disclosure({
            open: amountsOpen,
            summary: amountSummary(value, (key, options) => this.t(key, options)),
            label: this.t('amounts_none'),
            testid: 'value-amounts',
            onToggle: () => (this.__amountsOpen = { ...this.__amountsOpen, [path]: !amountsOpen }),
          })}
        </div>
        ${this.__uploadError === path
          ? html`<p class="text-xs text-error" role="alert" data-testid="value-image-error">
              ${this.t(this.__uploadTooLarge ? 'image_error_too_large' : 'image_error_upload')}
            </p>`
          : ''}
        ${amountsOpen
          ? html`
              <div class="pd-amounts" data-testid="value-amount-fields">
                ${rowField({
                  label: this.t('price_mod_label'),
                  helperText: this.t('price_mod_helper_text'),
                  placeholder: '0.00',
                  value: value.price_mod,
                  error: amountErrors[0],
                  path: `${path}.price_mod`,
                  locked,
                  visibleLabel: true,
                  testid: 'value-price-mod',
                  onChange: amount => onChange(withField(value, 'price_mod', amount)),
                })}
                ${rowField({
                  label: this.t('weight_mod_label'),
                  helperText: this.t('weight_mod_helper_text'),
                  placeholder: '0',
                  value: value.weight_mod,
                  error: amountErrors[1],
                  path: `${path}.weight_mod`,
                  locked,
                  visibleLabel: true,
                  testid: 'value-weight-mod',
                  onChange: weight => onChange(withField(value, 'weight_mod', parseWeight(weight))),
                })}
              </div>
            `
          : ''}
      </div>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    // Once nothing is wrong, a field added later starts out unmarked again.
    if (this.__shown.length && !validateOptions(this.__options, this.modifierNames).length) {
      this.__shown = [];
    }
    if (!this.__focusNext) return;
    const [path, testid] = this.__focusNext;
    this.__focusNext = null;
    this.renderRoot
      .querySelector<HTMLElement>(`[data-path="${path}"] [data-testid="${testid}"]`)
      ?.focus();
  }

  private __toggleUrl(path: string, open: boolean) {
    this.__urlFor = open ? path : '';
    this.__urlError = '';
    this.__focusNext = [path, open ? 'value-image-url-input' : 'value-image-by-url'];
  }

  /** Uploads the picked file as the image of the value at `path`, as product images upload. */
  private async __uploadImage(evt: Event, path: string) {
    const input = evt.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    const form = this.nucleon as ProductForm | null;
    input.value = '';
    if (!form || !file) return;

    const [, optionIndex, , valueIndex] = path.split('.').map(Number);
    const before = this.__options[optionIndex]?.values[valueIndex];
    this.__uploadError = '';
    this.__uploading = path;

    try {
      const src = await form.uploadImage(file);
      // The list may have changed while the file was on its way.
      const options = this.__options;
      const value = options[optionIndex]?.values[valueIndex];
      if (!value || value.value !== before?.value) return;
      const values = [...options[optionIndex].values];
      values[valueIndex] = { ...value, image: { ...value.image, src } };
      this.__setOptions(options.map((o, i) => (i === optionIndex ? { ...o, values } : o)));
    } catch (err) {
      this.__uploadTooLarge = err instanceof ImageTooLargeError;
      this.__uploadError = path;
    } finally {
      this.__uploading = '';
    }
  }

  /**
   * Saves what is being typed. A field saves when focus leaves it, and that can
   * move the button being pressed from under the pointer, so the buttons that
   * add to the list keep focus where it is and save the field themselves.
   */
  private __commitField() {
    const root = this.renderRoot as ShadowRoot;
    const field = root.querySelector<HTMLElement>('vaadin-text-field[focused]');
    (field ?? (root.activeElement as HTMLElement | null))?.blur();
  }

  private async __addValue(index: number) {
    this.__commitField();
    this.__setOptions(
      this.__options.map((option, i) =>
        i === index ? { ...option, values: [...(option.values ?? []), { value: '' }] } : option
      )
    );

    await (this.nucleon as LitElement | null)?.updateComplete;
    await this.updateComplete;
    const option = this.renderRoot.querySelectorAll('[data-testid="option"]')[index];
    const fields = option?.querySelectorAll<HTMLElement>('[data-testid="value-value"]');
    fields?.[fields.length - 1]?.focus();
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
