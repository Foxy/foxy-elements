import type { ProductModifier, ProductModifierRemoval, ProductModifierValue } from '../../types';

import type { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import type { CheckboxElement } from '@vaadin/vaadin-checkbox';
import type { ProductForm } from '../../ProductForm';
import type { PropertyDeclarations, TemplateResult } from 'lit-element';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { LIMITS, isRemoval, validateModifiers } from '../../catalog';
import { listActions, move, parseWeight, textField, withField } from '../fields';
import { html } from 'lit-element';

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
      inherited: { attribute: false },
      optionNames: { attribute: false },
    };
  }

  /** The compiled modifiers of the product this one inherits from. */
  inherited: ProductModifier[] = [];

  /** Names of the product's options, which a modifier can't share. */
  optionNames: string[] = [];

  renderControl(): TemplateResult {
    const own = this.__own;
    const inherited = this.inherited;
    const errors = validateModifiers(own, inherited, this.optionNames);
    const error = (path: string) => {
      const found = errors.find(e => e.path === path);
      return found ? this.t(found.code) : undefined;
    };

    const rows = this.__rows(inherited, own);
    const ownRows = rows.filter(row => row.kind === 'own');
    const locked = this.disabled || this.readonly;

    return html`
      <div class="grid gap-m">
        <div>
          <span class="text-l font-medium">${this.t('label')}</span>
          <p class="text-s text-secondary leading-s">${this.t('helper_text')}</p>
          ${error('modifiers')
            ? html`<p class="text-s text-error" data-testid="modifiers-error">
                ${error('modifiers')}
              </p>`
            : ''}
        </div>

        ${rows.map(row => {
          if (row.kind === 'inherited' || row.kind === 'removed') {
            return this.__renderInherited(row, locked);
          }
          if (row.kind === 'stale') return this.__renderStale(row, locked);
          return this.__renderEditor(row, locked, error, ownRows);
        })}

        <div>
          <vaadin-button
            data-testid="add-modifier"
            ?disabled=${locked}
            @click=${() => this.__setOwn([...own, { name: '', type: 'text' }])}
          >
            ${this.t('add_modifier')}
          </vaadin-button>
        </div>
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

    return html`
      <div
        class="grid gap-xs border border-contrast-10 rounded p-m ${removed ? 'text-tertiary' : ''}"
        data-testid="modifier-inherited"
        data-name=${modifier.name}
      >
        <div class="flex flex-wrap items-center" style="gap: 0.5rem">
          <span class="font-medium">${modifier.label || modifier.name}</span>
          <span class="text-s text-secondary">${modifier.name}</span>
          <span class="text-s rounded-s bg-contrast-5 px-xs">
            ${this.t(removed ? 'removed_badge' : 'inherited_badge')}
          </span>
        </div>
        <p class="text-s text-secondary">${this.__summary(modifier)}</p>
        <div class="flex flex-wrap text-s" style="gap: 1rem">
          ${removed
            ? html`
                <button
                  class="text-primary"
                  type="button"
                  data-testid="restore"
                  ?disabled=${locked}
                  @click=${() => this.__setOwn(this.__own.filter((_, i) => i !== ownIndex))}
                >
                  ${this.t('restore')}
                </button>
              `
            : html`
                <button
                  class="text-primary"
                  type="button"
                  data-testid="override"
                  ?disabled=${locked}
                  @click=${() => this.__setOwn([...this.__own, structuredCopy(modifier)])}
                >
                  ${this.t('override')}
                </button>
                <button
                  class="text-error"
                  type="button"
                  data-testid="remove-inherited"
                  ?disabled=${locked}
                  @click=${() =>
                    this.__setOwn([...this.__own, { name: modifier.name, remove: true }])}
                >
                  ${this.t('remove_inherited')}
                </button>
              `}
        </div>
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
    ownRows: Row[]
  ) {
    const modifier = row.modifier;
    const path = `modifiers.${row.ownIndex}`;
    const isOverride = row.kind === 'override';
    const set = (changed: ProductModifier) =>
      this.__setOwn(this.__own.map((m, i) => (i === row.ownIndex ? changed : m)));
    const values = modifier.values ?? [];
    const setValues = (changed: ProductModifierValue[]) => set({ ...modifier, values: changed });
    const types = [
      { label: this.t('type_text'), value: 'text' },
      { label: this.t('type_select'), value: 'select' },
    ];

    return html`
      <div
        class="grid gap-s border border-contrast-10 rounded p-m"
        data-testid=${isOverride ? 'modifier-override' : 'modifier'}
        data-name=${modifier.name}
      >
        ${isOverride
          ? html`
              <div class="flex flex-wrap items-center justify-between" style="gap: 0.5rem">
                <span class="text-s rounded-s bg-contrast-5 px-xs">
                  ${this.t('override_badge')}
                </span>
                <button
                  class="text-s text-primary"
                  type="button"
                  data-testid="use-inherited"
                  ?disabled=${locked}
                  @click=${() => this.__setOwn(this.__own.filter((_, i) => i !== row.ownIndex))}
                >
                  ${this.t('use_inherited')}
                </button>
              </div>
            `
          : ''}

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
            locked,
            testid: 'modifier-label',
            onChange: label => set(withField(modifier, 'label', label)),
          })}
          <vaadin-combo-box
            data-testid="modifier-type"
            label=${this.t('type_label')}
            item-label-path="label"
            item-value-path="value"
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
              <span class="font-medium">${this.t('values_label')}</span>
              ${error(`${path}.values`)
                ? html`<p class="text-s text-error">${error(`${path}.values`)}</p>`
                : ''}
              ${values.map((value, index) =>
                this.__renderValue(value, `${path}.values.${index}`, locked, error, {
                  index,
                  length: values.length,
                  onChange: changed => setValues(values.map((v, i) => (i === index ? changed : v))),
                  onMove: (from, to) => setValues(move(values, from, to)),
                  onRemove: () => setValues(values.filter((_, i) => i !== index)),
                })
              )}
              <button
                class="text-s font-medium text-primary justify-self-start"
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
                  locked,
                  testid: 'modifier-max-length',
                  onChange: max => set(withField(modifier, 'max_length', parseWeight(max))),
                })}
                ${this.__amountFields(modifier, path, locked, error, set, 'text_')}
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

  private __amountFields<T extends { price_mod?: number | string; weight_mod?: number }>(
    item: T,
    path: string,
    locked: boolean,
    error: (path: string) => string | undefined,
    set: (changed: T) => void,
    /** Leads the helper text keys; `null` leaves the helper text out. */
    prefix: string | null = ''
  ) {
    const help = (key: string) => (prefix === null ? undefined : this.t(`${prefix}${key}`));
    return html`
      ${textField({
        label: this.t('price_mod_label'),
        helperText: help('price_mod_helper_text'),
        placeholder: '0.00',
        value: item.price_mod,
        error: error(`${path}.price_mod`),
        locked,
        testid: 'price-mod',
        onChange: amount => set(withField(item, 'price_mod', amount)),
      })}
      ${textField({
        label: this.t('weight_mod_label'),
        helperText: help('weight_mod_helper_text'),
        placeholder: '0',
        value: item.weight_mod,
        error: error(`${path}.weight_mod`),
        locked,
        testid: 'weight-mod',
        onChange: weight => set(withField(item, 'weight_mod', parseWeight(weight))),
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
    // Said once, on the first value, rather than on every one.
    const help = (key: string) => (list.index === 0 ? this.t(key) : undefined);
    return html`
      <div class="grid gap-s border-t border-contrast-10 pt-s" data-testid="modifier-value">
        <div
          class="grid gap-s"
          style="grid-template-columns: repeat(auto-fill, minmax(11rem, 1fr))"
        >
          ${textField({
            label: this.t('value_label'),
            helperText: help('value_helper_text'),
            placeholder: 'Yes',
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
            label: this.t('category_code_label'),
            helperText: help('category_code_helper_text'),
            value: value.category_code,
            error: error(`${path}.category_code`),
            locked,
            testid: 'value-category-code',
            onChange: code => onChange(withField(value, 'category_code', code)),
          })}
          ${this.__amountFields(value, path, locked, error, onChange, list.index === 0 ? '' : null)}
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
