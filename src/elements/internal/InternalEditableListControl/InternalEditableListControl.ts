import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Item, Option, Unit } from './types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { html, css } from 'lit-element';
import { classMap } from '../../../utils/class-map';
import { repeat } from 'lit-html/directives/repeat';
import { spread } from '@open-wc/lit-helpers';
import { live } from 'lit-html/directives/live';

export class InternalEditableListControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      inputParams: { attribute: false },
      simpleValue: { type: Boolean, attribute: 'simple-value' },
      options: { type: Array },
      layout: {},
      units: { type: Array },
      range: {},
      __isErrorVisible: { attribute: false },
      __newItem: { attribute: false },
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        div:has(> select) {
          position: relative;
        }

        div:has(> select)::after {
          content: ' ';
          position: absolute;
          top: 50%;
          margin-top: -2px;
          right: 10px;
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-top: 5px solid currentColor;
        }
      `,
    ];
  }

  inputParams: Record<string, unknown> = {};

  simpleValue = false;

  options: Option[] = [];

  layout: 'standalone' | 'summary-item' | null = null;

  units: Unit[] = [];

  range: null | 'optional' = null;

  private __isErrorVisible = false;

  private __newItem = '';

  render(): TemplateResult {
    const isSummaryItem = this.layout === 'summary-item';
    const isInteractive = !this.disabled && !this.readonly;

    const deleteButtonClass = classMap({
      'w-xs h-xs rounded-s transition-colors flex-shrink-0': true,
      'focus-outline-none focus-ring-2 ring-inset ring-error-50': true,
      'text-tertiary hover-bg-error-10 hover-text-error': !this.disabled,
      'cursor-default text-disabled': this.disabled,
      'flex items-center justify-center': !this.readonly,
      'hidden': this.readonly,
      'mr-xs': !isSummaryItem,
    });

    const itemClass = classMap({
      'transition-colors flex items-center': true,
      'text-secondary': this.readonly,
      'text-disabled': this.disabled,
      'border border-contrast-10 rounded-s': isSummaryItem,
      'h-m': !isSummaryItem,
    });

    const isAddButtonDisabled = this.disabled || !this.__newItem;

    const addItem = (split = false) => {
      const newValue = [...this._value];
      const splitBy = split && this.__newItem.includes(',') ? ',' : '\n';
      const unit = this.renderRoot.querySelector('select')?.value;

      this.__newItem
        .split(splitBy)
        .map(code => code.trim())
        .filter(code => code.length > 0)
        .forEach(value => {
          if (!newValue.some(item => item.value === value)) {
            newValue.push({ value, unit });
          }
        });

      this._value = newValue;
      this.__newItem = '';
    };

    return html`
      <div class="mb-s" ?hidden=${!this.label && !this.helperText}>
        <div class=${classMap({ 'font-medium text-l': !isSummaryItem })}>${this.label}</div>
        <div
          class=${classMap({
            'text-secondary': true,
            'text-xs': isSummaryItem,
            'text-s': !isSummaryItem,
          })}
          ?hidden=${!this.helperText}
        >
          ${this.helperText}
        </div>
      </div>

      <div
        class=${classMap({
          'bg-contrast-5 rounded': !isSummaryItem,
          'mt-s': isSummaryItem,
        })}
      >
        <ol
          class=${classMap({
            'transition-colors font-medium': true,
            'divide-y divide-contrast-10': !isSummaryItem,
            'flex flex-wrap gap-s': isSummaryItem,
          })}
        >
          ${repeat(
            this._value,
            item => item.value,
            (item, index) => {
              return html`
                <li
                  class=${itemClass}
                  style="padding-left: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
                >
                  <div class="flex-1 mr-s">${item.label ?? item.value}</div>

                  <button
                    aria-label=${this.t('delete')}
                    class=${deleteButtonClass}
                    ?disabled=${this.disabled}
                    @click=${() => {
                      this._value = this._value.filter((_, i) => i !== index);
                    }}
                  >
                    <iron-icon icon="lumo:cross" class="icon-inline text-xl"></iron-icon>
                  </button>
                </li>
              `;
            }
          )}
        </ol>

        <div
          style="padding-left: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
          class=${classMap({
            'transition-colors h-m flex items-center gap-xs': true,
            'focus-within-ring-2 focus-within-ring-primary-50': !isSummaryItem,
            'bg-contrast-5 hover-bg-contrast-10': !isSummaryItem && isInteractive,
            'bg-contrast-5': !isSummaryItem && this.disabled,
            'flex': !this.readonly,
            'hidden': this.readonly,
            'rounded-s border border-contrast-10': isSummaryItem,
            'mt-s': isSummaryItem && this._value.length > 0,
            'rounded': !isSummaryItem && this._value.length === 0,
            'rounded-b': !isSummaryItem && this._value.length > 0,
          })}
        >
          ${this.range
            ? html`
                <foxy-i18n infer="" class="text-disabled font-medium" key="range_from"> </foxy-i18n>

                <input
                  placeholder=${this.placeholder}
                  class=${classMap({
                    'bg-transparent appearance-none h-m font-medium focus-outline-none': true,
                    'text-disabled': this.disabled,
                  })}
                  list="list"
                  ...=${spread(this.inputParams)}
                  .value=${live(this.__newItem.split('..')[0] ?? '')}
                  ?disabled=${this.disabled}
                  ?readonly=${this.readonly}
                  @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && addItem()}
                  @change=${(evt: Event) => evt.stopPropagation()}
                  @input=${(evt: InputEvent) => {
                    const newFrom = (evt.currentTarget as HTMLInputElement).value.trim();
                    const oldTo = this.__newItem.split('..')[1] ?? '';
                    this.__newItem = oldTo ? `${newFrom}..${oldTo}` : newFrom;
                  }}
                  @paste=${(evt: ClipboardEvent) => {
                    evt.preventDefault();

                    const newFrom = evt.clipboardData?.getData('text') ?? '';
                    const oldTo = this.__newItem.split('..')[1] ?? '';
                    this.__newItem = oldTo ? `${newFrom}..${oldTo}` : newFrom;

                    addItem();
                  }}
                  @blur=${() => {
                    this.__isErrorVisible = true;
                  }}
                />

                <foxy-i18n infer="" class="text-disabled font-medium" key="range_to"></foxy-i18n>

                <input
                  placeholder=${this.placeholder}
                  class=${classMap({
                    'bg-transparent appearance-none h-m font-medium focus-outline-none': true,
                    'text-disabled': this.disabled,
                  })}
                  list="list"
                  ...=${spread(this.inputParams)}
                  .value=${live(this.__newItem.split('..')[1] ?? '')}
                  ?disabled=${this.disabled}
                  ?readonly=${this.readonly}
                  @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && addItem()}
                  @change=${(evt: Event) => evt.stopPropagation()}
                  @input=${(evt: InputEvent) => {
                    const newTo = (evt.currentTarget as HTMLInputElement).value.trim();
                    const oldFrom = this.__newItem.split('..')[0] ?? '';
                    this.__newItem = oldFrom ? `${oldFrom}..${newTo}` : newTo;
                  }}
                  @paste=${(evt: ClipboardEvent) => {
                    evt.preventDefault();

                    const newTo = evt.clipboardData?.getData('text') ?? '';
                    const oldFrom = this.__newItem.split('..')[0] ?? '';
                    this.__newItem = oldFrom ? `${oldFrom}..${newTo}` : newTo;

                    addItem();
                  }}
                  @blur=${() => {
                    this.__isErrorVisible = true;
                  }}
                />
              `
            : html`
                <input
                  placeholder=${this.placeholder}
                  class=${classMap({
                    'w-full bg-transparent appearance-none h-m font-medium focus-outline-none':
                      true,
                    'text-disabled': this.disabled,
                  })}
                  list="list"
                  ...=${spread(this.inputParams)}
                  .value=${live(this.__newItem)}
                  ?disabled=${this.disabled}
                  ?readonly=${this.readonly}
                  @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && addItem()}
                  @change=${(evt: Event) => evt.stopPropagation()}
                  @input=${(evt: InputEvent) => {
                    this.__newItem = (evt.currentTarget as HTMLInputElement).value.trim();
                  }}
                  @paste=${(evt: ClipboardEvent) => {
                    evt.preventDefault();
                    this.__newItem = evt.clipboardData?.getData('text') ?? '';
                    if (this.__newItem.includes('\n') || this.__newItem.includes(','))
                      addItem(true);
                  }}
                  @blur=${() => {
                    this.__isErrorVisible = true;
                  }}
                />
              `}

          <div
            class=${classMap({
              'relative': true,
              'hover-text-base focus-within-text-primary-contrast': !this.disabled,
              'text-disabled': this.disabled,
            })}
            ?hidden=${this.units.length === 0}
          >
            <select
              style="min-width: 8rem"
              class=${classMap({
                'transition-colors rounded-s mx-xs px-s': true,
                'bg-contrast-5 appearance-none h-xs font-medium focus-outline-none': true,
                'hover-bg-contrast focus-bg-primary': !this.disabled,
              })}
              ?disabled=${this.disabled}
            >
              ${this.units.map(({ label, value }) => {
                return html`<option value=${value}>${label ?? value}</option>`;
              })}
            </select>
          </div>

          <datalist id="list">
            ${this.options.map(({ label, value }) => {
              if (this._value.some(item => item.value === value)) return;
              return html`<option value=${value}>${label ?? value}</option>`;
            })}
          </datalist>

          <div class="mr-xs ml-auto" ?hidden=${!this.__newItem}>
            <button
              aria-label=${this.t('submit')}
              class=${classMap({
                'w-xs h-xs flex-shrink-0 ring-inset ring-success-50 focus-outline-none': true,
                'flex items-center justify-center rounded-s transition-colors': true,
                'bg-contrast-5 text-disabled cursor-default': isAddButtonDisabled,
                'bg-contrast-5 text-body cursor-pointer': !isAddButtonDisabled,
                'hover-bg-success hover-text-success-contrast': !isAddButtonDisabled,
                'focus-ring-2': !isAddButtonDisabled,
              })}
              ?disabled=${isAddButtonDisabled}
              @click=${addItem}
            >
              <iron-icon icon="lumo:plus" class="icon-inline text-l"></iron-icon>
            </button>
          </div>
        </div>
      </div>

      <div
        class=${classMap({
          'mt-s leading-xs text-error': true,
          'text-xs': isSummaryItem,
          'text-s': !isSummaryItem,
        })}
        ?hidden=${!this.__isErrorVisible || !this._errorMessage || this.disabled || this.readonly}
      >
        ${this._errorMessage}
      </div>
    `;
  }

  protected get _value(): Item[] {
    const value = super._value;
    if (this.simpleValue) return ((value as string[]) ?? []).map(value => ({ value }));
    return (value ?? []) as Item[];
  }

  protected set _value(newValue: Item[]) {
    if (this.simpleValue) {
      super._value = newValue.map(({ value }) => value);
    } else {
      super._value = newValue;
    }
  }
}
