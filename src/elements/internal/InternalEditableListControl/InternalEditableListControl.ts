import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Item, Option } from './types';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { classMap } from '../../../utils/class-map';
import { repeat } from 'lit-html/directives/repeat';
import { live } from 'lit-html/directives/live';
import { html } from 'lit-element';

export class InternalEditableListControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      options: { type: Array },
      __newItem: { attribute: false },
    };
  }

  options: Option[] = [];

  private __newItem = '';

  render(): TemplateResult {
    const deleteButtonClass = classMap({
      'w-xs h-xs mr-xs rounded-full transition-colors flex-shrink-0': true,
      'focus-outline-none focus-ring-2 ring-inset ring-error-50': true,
      'text-tertiary hover-bg-error-10 hover-text-error': !this.disabled,
      'cursor-default text-disabled': this.disabled,
      'flex items-center justify-center': !this.readonly,
      'hidden': this.readonly,
    });

    const itemClass = classMap({
      'transition-colors h-m ml-s flex items-center': true,
      'text-secondary': this.readonly,
      'text-disabled': this.disabled,
    });

    const isAddButtonDisabled = this.disabled || !this.__newItem;

    const addItem = () => {
      if (!this.__newItem) return;
      this._value = [...this._value, { value: this.__newItem }];
      this.__newItem = '';
    };

    return html`
      <div class="group">
        <div
          class="transition-colors mb-xs font-medium text-s text-secondary group-hover-text-body"
        >
          ${this.label}
        </div>

        <div
          class="border border-contrast-10 rounded transition-colors group-hover-border-contrast-20"
        >
          <ol
            class="transition-colors divide-y divide-contrast-10 font-medium group-hover-divide-contrast-20"
          >
            ${repeat(
              this._value,
              item => item.value,
              (item, index) => {
                return html`
                  <li class=${itemClass}>
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
            style=${this._value.length === 0
              ? 'border-radius: calc(var(--lumo-border-radius-m) - 1px)'
              : 'border-radius: 0 0 calc(var(--lumo-border-radius-m) - 1px) calc(var(--lumo-border-radius-m) - 1px)'}
            class=${classMap({
              'transition-colors bg-contrast-10 pl-s h-m flex items-center': true,
              'focus-within-ring-2 focus-within-ring-primary-50': true,
              'group-hover-bg-contrast-20': true,
              'flex': !this.readonly,
              'hidden': this.readonly,
            })}
          >
            <input
              placeholder=${this.placeholder}
              class="w-full bg-transparent appearance-none h-m font-medium focus-outline-none"
              list="list"
              .value=${live(this.__newItem)}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              @keydown=${(evt: KeyboardEvent) => evt.key === 'Enter' && addItem()}
              @change=${(evt: Event) => evt.stopPropagation()}
              @input=${(evt: InputEvent) => {
                this.__newItem = (evt.currentTarget as HTMLInputElement).value.trim();
              }}
            />

            <datalist id="list">
              ${this.options.map(({ label, value }) => {
                if (this._value.some(item => item.value === value)) return;
                return html`<option value=${value}>${label ?? value}</option>`;
              })}
            </datalist>

            <div class="transition-opacity ${this.__newItem ? 'opacity-100' : 'opacity-0'}">
              <button
                aria-label=${this.t('submit')}
                class=${classMap({
                  'w-xs h-xs mr-xs flex-shrink-0 ring-inset ring-success-50 focus-outline-none':
                    true,
                  'flex items-center justify-center rounded-full transition-colors': true,
                  'bg-contrast-5 text-disabled cursor-default': isAddButtonDisabled,
                  'bg-success-10 text-success cursor-pointer': !isAddButtonDisabled,
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

        <div class="transition-colors mt-xs text-xs text-secondary group-hover-text-body">
          ${this.helperText}
        </div>
      </div>
    `;
  }

  protected get _value(): Item[] {
    return (super._value ?? []) as Item[];
  }

  protected set _value(newValue: Item[]) {
    super._value = newValue;
  }
}
