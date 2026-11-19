import type { ProductModifier, ProductModifierRemoval, ProductModifierValue } from '../../types';

import type { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { ProductForm } from '../../ProductForm';
import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { LIMITS, isRemoval, validateModifiers } from '../../catalog';
import { rowStyles } from '../styles';
import { html } from 'lit-element';
import {
  amountSummary,
  disclosure,
  isShown,
  leftField,
  listActions,
  move,
  parseWeight,
  rowErrors,
  rowField,
  textField,
  withField,
} from '../fields';

const VALUE_COLUMNS = 'minmax(0, 1fr) minmax(0, 1fr) 5.25rem';

type Own = ProductModifier | ProductModifierRemoval;

/** One entry of the compiled list, and where it comes from. */
type Row =
  | { kind: 'inherited'; modifier: ProductModifier }
  | { kind: 'removed'; modifier: ProductModifier; ownIndex: number }
  | { kind: 'override'; modifier: ProductModifier; ownIndex: number }
  | { kind: 'own'; modifier: ProductModifier; ownIndex: number }
  | { kind: 'stale'; modifier: ProductModifierRemoval; ownIndex: number };

/**
 * A product's modifiers: choices the shopper makes that are recorded on the
 * cart item without making variants, such as engraving or gift wrap. Shows
 * the inherited ones in place, each of which can be overridden or removed
 * here by name.
 *
 * @element foxy-internal-product-form-modifiers-control
 */
export class InternalProductFormModifiersControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      inheritedFrom: { attribute: false },
      inherited: { attribute: false },
      optionNames: { attribute: false },
      __detailsOpen: { attribute: false },
      __managed: { attribute: false },
      __shown: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [...super.styles, rowStyles];
  }

  /** The compiled modifiers of the product this one inherits from. */
  inherited: ProductModifier[] = [];

  /** Where the inherited modifiers come from. */
  inheritedFrom: 'parent' | 'template' = 'parent';

  /** What the merchant is done with, whose mistakes show: see `isShown`. */
  private __shown: string[] = [];

  /** Whether each modifier's editor is open, by name, where the merchant chose. */
  private __managed: Record<string, boolean> = {};

  /** Whether a value's price, weight and category fields are open, by the value's path. */
  private __detailsOpen: Record<string, boolean> = {};

  /** Names of the product's options, which a modifier can't share. */
  optionNames: string[] = [];

  renderControl(): TemplateResult {
    const own = this.__own;
    const inherited = this.inherited;
    const errors = validateModifiers(own, inherited, this.optionNames);
    const error = (path: string) => {
      const found = errors.find(e => e.path === path);
      if (!found) return undefined;
      // A wrong value shows at once; a missing one only once the merchant is done with it.
      const missing = found.code.endsWith('_required');
      return missing && !isShown(path, this.__shown) ? undefined : this.t(found.code);
    };

    const rows = this.__rows(inherited, own);
    const ownRows = rows.filter(row => row.kind === 'own');
    const locked = this.disabled || this.readonly;

    return html`
      <div class="grid gap-m" @focusout=${this.__handleFocusOut}>
        ${error('modifiers')
          ? html`<p class="text-s text-error" data-testid="modifiers-error">
              ${error('modifiers')}
            </p>`
          : ''}
        ${rows.map(row => {
          if (row.kind === 'inherited' || row.kind === 'removed') {
            return this.__renderInherited(row, locked);
          }
          if (row.kind === 'stale') return this.__renderStale(row, locked);
          return this.__renderEditor(row, locked, error, ownRows, errors);
        })}

        <div>
          <vaadin-button
            data-testid="add-modifier"
            ?disabled=${locked}
            @click=${() => this.__setOwn([...own, { name: '', type: 'text' }])}
          >
            ${this.t('add_modifier')}
          </vaadin-button>
          <span
            class="text-s text-secondary"
            style="margin-left: 0.5rem"
            data-testid="modifiers-on"
          >
            ${this.t('on_count', {
              count: rows.filter(row => row.kind !== 'removed' && row.kind !== 'stale').length,
              limit: LIMITS.modifiers,
            })}
          </span>
        </div>
      </div>
    `;
  }

  private __renderSwitch(
    on: boolean,
    label: string,
    testid: string,
    locked: boolean,
    toggle: () => void
  ) {
    return html`
      <button
        type="button"
        role="switch"
        class="relative flex-shrink-0 ${on ? 'bg-primary' : 'bg-contrast-50'}"
        style="width: 2.75rem; height: 1.5rem; border-radius: 0.75rem"
        data-testid=${testid}
        aria-checked=${on ? 'true' : 'false'}
        aria-label=${label}
        ?disabled=${locked}
        @click=${toggle}
      >
        <span
          class="absolute rounded-full bg-base shadow-xs"
          style="top: 0.1875rem; left: ${on
            ? '1.4375rem'
            : '0.1875rem'}; width: 1.125rem; height: 1.125rem; transition: left 0.15s"
        ></span>
      </button>
    `;
  }

  private __renderTitle(modifier: ProductModifier) {
    return html`
      <div class="flex-1 min-w-0 grid" style="gap: 0.1875rem; min-width: 14rem">
        <p class="flex flex-wrap items-center font-semibold" style="gap: 0.5rem">
          ${modifier.label || modifier.name || this.t('new_modifier')}
          <span class="text-xs font-semibold rounded-s bg-contrast-10 px-xs">
            ${this.t(modifier.type === 'select' ? 'type_badge_select' : 'type_badge_text')}
          </span>
          <span class="text-s font-normal text-secondary">${modifier.name}</span>
        </p>
        <p class="text-s text-secondary">${this.__summary(modifier)}</p>
      </div>
    `;
  }

  private __rows(inherited: ProductModifier[], own: Own[]): Row[] {
    const rows: Row[] = inherited.map(modifier => {
      const ownIndex = own.findIndex(m => m.name === modifier.name);
      if (ownIndex === -1) return { kind: 'inherited', modifier };
      const entry = own[ownIndex];
      if (isRemoval(entry)) return { kind: 'removed', modifier, ownIndex };
      return { kind: 'override', modifier: entry, ownIndex };
    });

    own.forEach((modifier, ownIndex) => {
      if (rows.some(row => 'ownIndex' in row && row.ownIndex === ownIndex)) return;
      if (isRemoval(modifier)) rows.push({ kind: 'stale', modifier, ownIndex });
      else rows.push({ kind: 'own', modifier, ownIndex });
    });

    return rows;
  }

  private __renderInherited(row: Row & { kind: 'inherited' | 'removed' }, locked: boolean) {
    const modifier = row.modifier;
    const removed = row.kind === 'removed';
    const ownIndex = row.kind === 'removed' ? row.ownIndex : -1;

    const name = modifier.label || modifier.name;

    return html`
      <div
        class="flex flex-wrap items-center border border-contrast-10 rounded p-m ${removed
          ? 'bg-contrast-5 text-secondary'
          : ''}"
        style="gap: 0.875rem"
        data-testid="modifier-inherited"
        data-name=${modifier.name}
      >
        ${this.__renderSwitch(
          !removed,
          this.t('switch_label', { name }),
          removed ? 'restore' : 'remove-inherited',
          locked,
          () =>
            this.__setOwn(
              removed
                ? this.__own.filter((_, i) => i !== ownIndex)
                : [...this.__own, { name: modifier.name, remove: true }]
            )
        )}
        ${this.__renderTitle(modifier)}
        <span
          class="text-xs rounded-s px-s ${removed
            ? 'bg-contrast-10'
            : 'bg-primary-10 text-primary'}"
          style="padding-top: 0.1875rem; padding-bottom: 0.1875rem; white-space: nowrap"
          data-testid="modifier-source"
        >
          ${removed ? this.t('removed_badge') : this.t(`inherited_badge_${this.inheritedFrom}`)}
        </span>
        ${removed
          ? ''
          : html`
              <button
                class="text-s rounded-s bg-contrast-10"
                style="height: 2rem; padding: 0 0.625rem"
                type="button"
                data-testid="override"
                aria-label=${this.t('manage_modifier', { name })}
                ?disabled=${locked}
                @click=${() => {
                  this.__managed = { ...this.__managed, [modifier.name]: true };
                  this.__setOwn([...this.__own, structuredCopy(modifier)]);
                }}
              >
                ${this.t('manage')}
              </button>
            `}
      </div>
    `;
  }

  // A removal whose name isn't inherited (any more) does nothing.
  private __renderStale(row: Row & { kind: 'stale' }, locked: boolean) {
    return html`
      <div class="flex items-center justify-between text-s text-secondary" data-testid="stale">
        <span>${this.t('stale_removal', { name: row.modifier.name })}</span>
        <button
          class="text-error"
          type="button"
          ?disabled=${locked}
          @click=${() => this.__setOwn(this.__own.filter((_, i) => i !== row.ownIndex))}
        >
          ${this.t('remove')}
        </button>
      </div>
    `;
  }

  private __renderEditor(
    row: Row & { kind: 'own' | 'override' },
    locked: boolean,
    error: (path: string) => string | undefined,
    ownRows: Row[],
    errors: { path: string }[]
  ) {
    const modifier = row.modifier;
    const form = this.nucleon as ProductForm | null;
    const isSaved = !!form?.data?.definition?.modifiers?.some(m => m.name === modifier.name);
    // A new modifier, or one with a mistake in it, opens by itself.
    const managed =
      this.__managed[modifier.name] ??
      (!isSaved || errors.some(e => e.path.startsWith(`modifiers.${row.ownIndex}`)));
    const title = modifier.label || modifier.name;
    const isOverride = row.kind === 'override';

    return html`
      <div
        class="grid gap-s border rounded p-m ${managed ? 'border-primary' : 'border-contrast-10'}"
        data-testid=${isOverride ? 'modifier-override' : 'modifier'}
        data-name=${modifier.name}
      >
        <div class="flex flex-wrap items-center" style="gap: 0.875rem">
          ${this.__renderTitle(modifier)}
          <span
            class="text-xs rounded-s px-s ${isOverride
              ? 'bg-contrast-10 text-body font-medium'
              : 'bg-success-10 text-success'}"
            style="padding-top: 0.1875rem; padding-bottom: 0.1875rem; white-space: nowrap"
            data-testid="modifier-source"
          >
            ${this.t(isOverride ? 'override_badge' : 'own_badge')}
          </span>
          ${isOverride
            ? html`
                <button
                  class="text-s text-primary"
                  type="button"
                  data-testid="use-inherited"
                  ?disabled=${locked}
                  @click=${() => this.__setOwn(this.__own.filter((_, i) => i !== row.ownIndex))}
                >
                  ${this.t('use_inherited')}
                </button>
              `
            : ''}
          <button
            class="text-s rounded-s ${managed ? 'bg-primary-10 text-primary' : 'bg-contrast-10'}"
            style="height: 2rem; padding: 0 0.625rem"
            type="button"
            data-testid="manage-modifier"
            aria-expanded=${managed ? 'true' : 'false'}
            aria-label=${this.t('manage_modifier', { name: title })}
            @click=${() => {
              // Done with mistakes in it shows them, and stays open to fix them.
              const path = `modifiers.${row.ownIndex}`;
              if (managed && errors.some(e => e.path.startsWith(`${path}.`))) {
                this.__shown = [...this.__shown, path];
              } else {
                this.__managed = { ...this.__managed, [modifier.name]: !managed };
              }
            }}
          >
            ${this.t(managed ? 'done' : 'manage')}
          </button>
        </div>

        ${managed ? this.__renderEditorFields(row, locked, error, ownRows) : ''}
      </div>
    `;
  }

  private __renderEditorFields(
    row: Row & { kind: 'own' | 'override' },
    locked: boolean,
    error: (path: string) => string | undefined,
    ownRows: Row[]
  ) {
    const modifier = row.modifier;
    const path = `modifiers.${row.ownIndex}`;
    const isOverride = row.kind === 'override';
    const set = (changed: ProductModifier) => {
      // The editor stays open under the modifier's new name.
      if (changed.name !== modifier.name && modifier.name in this.__managed) {
        this.__managed = { ...this.__managed, [changed.name]: this.__managed[modifier.name] };
      }
      this.__setOwn(this.__own.map((m, i) => (i === row.ownIndex ? changed : m)));
    };
    const values = modifier.values ?? [];
    const setValues = (changed: ProductModifierValue[]) => set({ ...modifier, values: changed });
    const types = [
      { label: this.t('type_text'), value: 'text' },
      { label: this.t('type_select'), value: 'select' },
    ];

    return html`
      <div class="grid gap-s border-t border-contrast-10 pt-s" data-testid="modifier-editor">
        <div
          class="grid gap-s"
          style="grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr))"
        >
          ${textField({
            label: this.t('name_label'),
            helperText: this.t('name_helper_text'),
            placeholder: 'gift_wrap',
            value: modifier.name,
            error: error(`${path}.name`),
            path: `${path}.name`,
            locked: locked || isOverride,
            testid: 'modifier-name',
            onChange: name => set({ ...modifier, name }),
          })}
          ${textField({
            label: this.t('modifier_label_label'),
            helperText: this.t('modifier_label_helper_text'),
            placeholder: modifier.name || 'Gift wrap',
            value: modifier.label,
            error: error(`${path}.label`),
            path: `${path}.label`,
            locked,
            testid: 'modifier-label',
            onChange: label => set(withField(modifier, 'label', label)),
          })}
          <vaadin-combo-box
            data-testid="modifier-type"
            label=${this.t('type_label')}
            item-label-path="label"
            item-value-path="value"
            data-field=${`${path}.type`}
            error-message=${this.t('v8n_type_required')}
            ?invalid=${!!error(`${path}.type`)}
            ?disabled=${locked}
            .items=${types}
            .value=${modifier.type}
            @change=${(evt: Event) => {
              const type = (evt.currentTarget as ComboBoxElement).value;
              if (type !== modifier.type) set(changeType(modifier, type));
            }}
          >
          </vaadin-combo-box>
        </div>

        <vaadin-checkbox
          data-testid="modifier-required"
          ?disabled=${locked}
          .checked=${!!modifier.required}
          @change=${(evt: Event) => {
            const required = (evt.currentTarget as CheckboxElement).checked;
            set(withField(modifier, 'required', required || undefined));
          }}
        >
          ${this.t('required_label')}
        </vaadin-checkbox>

        ${modifier.type === 'select'
          ? html`
              <div>
                <h4 class="font-semibold">${this.t('values_label')}</h4>
                <p class="text-xs text-secondary">${this.t('values_helper_text')}</p>
              </div>
              ${error(`${path}.values`)
                ? html`<p class="text-s text-error">${error(`${path}.values`)}</p>`
                : ''}
              <div class="pd-values">
                <div
                  class="pd-value-head"
                  style="--pd-columns: ${VALUE_COLUMNS}"
                  aria-hidden="true"
                >
                  <span>${this.t('value_label')}</span>
                  <span>${this.t('value_display_label')}</span>
                </div>
                ${values.map((value, index) =>
                  this.__renderValue(value, `${path}.values.${index}`, locked, error, {
                    index,
                    length: values.length,
                    onChange: changed =>
                      setValues(values.map((v, i) => (i === index ? changed : v))),
                    onMove: (from, to) => setValues(move(values, from, to)),
                    onRemove: () => setValues(values.filter((_, i) => i !== index)),
                  })
                )}
              </div>
              <button
                class="text-s font-medium rounded-s bg-primary-10 text-primary justify-self-start"
                style="height: 2rem; padding: 0 0.625rem"
                type="button"
                data-testid="add-modifier-value"
                ?disabled=${locked || values.length >= LIMITS.values}
                @click=${() => setValues([...values, { value: '' }])}
              >
                ${this.t('add_value')}
              </button>
            `
          : html`
              <div
                class="grid gap-s"
                style="grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr))"
              >
                ${textField({
                  label: this.t('max_length_label'),
                  helperText: this.t('max_length_helper_text'),
                  placeholder: String(LIMITS.maxLengthDefault),
                  value: modifier.max_length,
                  error: error(`${path}.max_length`),
                  path: `${path}.max_length`,
                  locked,
                  testid: 'modifier-max-length',
                  onChange: max => set(withField(modifier, 'max_length', parseWeight(max))),
                })}
                ${this.__amountFields(modifier, path, locked, error, set)}
              </div>
            `}
        ${isOverride
          ? ''
          : listActions({
              index: ownRows.indexOf(row),
              length: ownRows.length,
              locked,
              t: key => this.t(`${key}_modifier`),
              testid: 'modifier-actions',
              onMove: (from, to) => {
                const a = (ownRows[from] as Row & { ownIndex: number }).ownIndex;
                const b = (ownRows[to] as Row & { ownIndex: number }).ownIndex;
                const own = [...this.__own];
                [own[a], own[b]] = [own[b], own[a]];
                this.__setOwn(own);
              },
              onRemove: () => this.__setOwn(this.__own.filter((_, i) => i !== row.ownIndex)),
            })}
      </div>
    `;
  }

  /** The price and weight a text modifier adds once the shopper types anything. */
  private __amountFields(
    modifier: ProductModifier,
    path: string,
    locked: boolean,
    error: (path: string) => string | undefined,
    set: (changed: ProductModifier) => void
  ) {
    return html`
      ${textField({
        label: this.t('price_mod_label'),
        helperText: this.t('text_price_mod_helper_text'),
        placeholder: '0.00',
        value: modifier.price_mod,
        error: error(`${path}.price_mod`),
        path: `${path}.price_mod`,
        locked,
        testid: 'price-mod',
        onChange: amount => set(withField(modifier, 'price_mod', amount)),
      })}
      ${textField({
        label: this.t('weight_mod_label'),
        helperText: this.t('weight_mod_helper_text'),
        placeholder: '0',
        value: modifier.weight_mod,
        error: error(`${path}.weight_mod`),
        path: `${path}.weight_mod`,
        locked,
        testid: 'weight-mod',
        onChange: weight => set(withField(modifier, 'weight_mod', parseWeight(weight))),
      })}
    `;
  }

  private __renderValue(
    value: ProductModifierValue,
    path: string,
    locked: boolean,
    error: (path: string) => string | undefined,
    list: {
      index: number;
      length: number;
      onChange: (value: ProductModifierValue) => void;
      onMove: (from: number, to: number) => void;
      onRemove: () => void;
    }
  ) {
    const { onChange } = list;
    const detailErrors = [
      error(`${path}.price_mod`),
      error(`${path}.weight_mod`),
      error(`${path}.category_code`),
    ];
    const open = this.__detailsOpen[path] ?? detailErrors.some(Boolean);
    const summary = [
      amountSummary(value, (key, options) => this.t(key, options)),
      value.category_code ? this.t('details_category', { code: value.category_code }) : '',
    ]
      .filter(Boolean)
      .join(' · ');

    return html`
      <div class="pd-value" data-testid="modifier-value">
        <div class="pd-value-main" style="--pd-columns: ${VALUE_COLUMNS}">
          ${rowField({
            label: this.t('value_label'),
            placeholder: 'Yes',
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
        ])}

        <div class="pd-value-extra">
          ${disclosure({
            open,
            summary,
            label: this.t('details_none'),
            testid: 'value-details',
            onToggle: () => (this.__detailsOpen = { ...this.__detailsOpen, [path]: !open }),
          })}
        </div>
        ${open
          ? html`
              <div class="pd-amounts" data-testid="value-detail-fields">
                ${rowField({
                  label: this.t('price_mod_label'),
                  helperText: this.t('price_mod_helper_text'),
                  placeholder: '0.00',
                  value: value.price_mod,
                  error: detailErrors[0],
                  path: `${path}.price_mod`,
                  locked,
                  visibleLabel: true,
                  testid: 'price-mod',
                  onChange: amount => onChange(withField(value, 'price_mod', amount)),
                })}
                ${rowField({
                  label: this.t('weight_mod_label'),
                  helperText: this.t('weight_mod_helper_text'),
                  placeholder: '0',
                  value: value.weight_mod,
                  error: detailErrors[1],
                  path: `${path}.weight_mod`,
                  locked,
                  visibleLabel: true,
                  testid: 'weight-mod',
                  onChange: weight => onChange(withField(value, 'weight_mod', parseWeight(weight))),
                })}
                ${rowField({
                  label: this.t('category_code_label'),
                  helperText: this.t('category_code_helper_text'),
                  value: value.category_code,
                  error: detailErrors[2],
                  path: `${path}.category_code`,
                  locked,
                  visibleLabel: true,
                  testid: 'value-category-code',
                  onChange: code => onChange(withField(value, 'category_code', code)),
                })}
              </div>
            `
          : ''}
      </div>
    `;
  }

  /** A line describing an inherited modifier, such as "Choice: No thanks, Wrap it (+4.50)". */
  private __summary(modifier: ProductModifier): string {
    const amount = (item: { price_mod?: number | string }) =>
      item.price_mod !== undefined && Number(item.price_mod) !== 0
        ? ` (${Number(item.price_mod) > 0 ? '+' : ''}${item.price_mod})`
        : '';
    const parts =
      modifier.type === 'select'
        ? [
            this.t('summary_select', {
              values: (modifier.values ?? [])
                .map(v => `${v.label || v.value}${amount(v)}`)
                .join(', '),
            }),
          ]
        : [
            this.t('summary_text', { count: modifier.max_length ?? LIMITS.maxLengthDefault }) +
              amount(modifier),
          ];
    if (modifier.required) parts.push(this.t('summary_required'));
    return parts.join(' · ');
  }

  /** Shows the mistakes of every modifier, as a save does. */
  reportValidity(): void {
    this.__shown = [''];
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    // Once nothing is wrong, a field added later starts out unmarked again.
    if (
      this.__shown.length &&
      !validateModifiers(this.__own, this.inherited, this.optionNames).length
    ) {
      this.__shown = [];
    }
  }

  private readonly __handleFocusOut = (evt: Event) => {
    const path = leftField(evt);
    if (path && !isShown(path, this.__shown)) this.__shown = [...this.__shown, path];
  };

  private get __own(): Own[] {
    const form = this.nucleon as ProductForm | null;
    return form?.form.definition?.modifiers ?? [];
  }

  private __setOwn(modifiers: Own[]) {
    const form = this.nucleon as ProductForm | null;
    if (!form) return;
    const definition = { ...form.form.definition };
    if (modifiers.length) definition.modifiers = modifiers;
    else delete definition.modifiers;
    form.edit({ definition });
  }
}

function structuredCopy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function changeType(modifier: ProductModifier, type: string): ProductModifier {
  const { name, label, required } = modifier;
  const base = withField(
    withField({ name } as ProductModifier, 'label', label),
    'required',
    required
  );
  if (type === 'select') return { ...base, type: 'select', values: [{ value: '' }] };
  return { ...base, type: 'text' };
}
