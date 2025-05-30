import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { classMap } from '../../../../../utils/class-map';
import { html } from 'lit-html';

export class InternalStoreTransactionFolderFormColorControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      colors: { type: Object },
    };
  }

  colors: Record<string, string> = {};

  renderControl(): TemplateResult {
    const currentValue = (this._value as string) in this.colors ? (this._value as string) : '';

    return html`
      <div class="flex flex-wrap items-center justify-center gap-s flex-shrink-0">
        ${Object.entries(this.colors).map(([colorName, className]) => {
          const isSelected = colorName === currentValue;

          return html`
            <div
              class=${classMap({
                'relative p-s -m-s rounded-s': true,
                'group transform transition-transform': true,
                'focus-within-ring-2 focus-within-ring-primary-50': true,
                'cursor-pointer hover-scale-150': !isSelected && !this.disabled && !this.readonly,
              })}
            >
              <div
                style="width: 1.25em; height: 1.25em; padding: 2px;"
                class=${classMap({
                  'relative rounded-full transition-all': true,
                  'ring-1 ring-contrast-10': !isSelected,
                  'ring-2 ring-contrast-80': isSelected && !this.disabled,
                  'ring-2 ring-contrast-10': isSelected && this.disabled,
                })}
              >
                <div
                  class=${classMap({
                    'w-full h-full rounded-full transition-opacity': true,
                    'opacity-25': this.disabled,
                    [className]: true,
                  })}
                ></div>
              </div>
              ${this.readonly
                ? ''
                : html`
                    <input
                      aria-label=${this.t(`color_${colorName || 'none'}`)}
                      class="absolute inset-0 block w-full h-full opacity-0"
                      value=${colorName}
                      name="color"
                      type="radio"
                      ?disabled=${this.disabled}
                      ?checked=${isSelected}
                      @change=${() => (this._value = colorName)}
                    />
                  `}
            </div>
          `;
        })}
      </div>
    `;
  }
}
