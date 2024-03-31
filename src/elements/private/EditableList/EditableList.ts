import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { live } from 'lit-html/directives/live';
import { repeat } from 'lit-html/directives/repeat';
import { InferrableMixin } from '../../../mixins/inferrable';

const Base = TranslatableMixin(ConfigurableMixin(ThemeableMixin(InferrableMixin(LitElement))));

/** @deprecated – use internal controls instead */
export class EditableList extends Base {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      options: { type: Array },
      items: { type: Array },
      __newItem: { attribute: false },
    };
  }

  options: { label?: string; value: string }[] = [];

  items: { label?: string | TemplateResult; value: string }[] = [];

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
      'transition-colors h-l ml-m flex items-center': true,
      'text-secondary': this.readonly,
      'text-disabled': this.disabled,
    });

    const isAddButtonDisabled = this.disabled || !this.__newItem;

    const addItem = () => {
      if (!this.__newItem) return;
      this.items.push({ value: this.__newItem });
      this.requestUpdate('items');
      this.dispatchEvent(new CustomEvent('change'));
      this.__newItem = '';
    };

    return html`
      <slot></slot>

      <ol class="divide-y divide-contrast-10">
        ${repeat(
          this.items,
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
                    this.items.splice(index, 1);
                    this.requestUpdate('items');
                    this.dispatchEvent(new CustomEvent('change'));
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
        class=${classMap({
          'ml-m h-l flex items-center': true,
          'border-t border-contrast-10': this.items.length > 0,
          'flex': !this.readonly,
          'hidden': this.readonly,
        })}
      >
        <input
          placeholder=${this.t('type_here')}
          class="w-full bg-transparent appearance-none h-m focus-outline-none"
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
            if (this.items.some(item => item.value === value)) return;
            return html`<option value=${value}>${label ?? value}</option>`;
          })}
        </datalist>

        <div class="transition-opacity ${this.__newItem ? 'opacity-100' : 'opacity-0'}">
          <button
            aria-label=${this.t('submit')}
            class=${classMap({
              'w-xs h-xs mr-xs flex-shrink-0 ring-inset ring-success-50 focus-outline-none': true,
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
    `;
  }
}
