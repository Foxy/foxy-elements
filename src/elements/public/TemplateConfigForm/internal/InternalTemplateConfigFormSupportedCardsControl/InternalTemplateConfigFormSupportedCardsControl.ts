import type { TemplateResult } from 'lit-html';

import * as logos from '../../../PaymentMethodCard/logos';

import { InternalEditableControl } from '../../../../internal/InternalEditableControl/InternalEditableControl';
import { classMap } from '../../../../../utils/class-map';
import { html } from 'lit-html';

export class InternalTemplateConfigFormSupportedCardsControl extends InternalEditableControl {
  renderControl(): TemplateResult {
    const typeToName: Record<string, string> = {
      amex: 'American Express',
      diners: 'Diners Club',
      discover: 'Discover',
      jcb: 'JCB',
      maestro: 'Maestro',
      mastercard: 'Mastercard',
      unionpay: 'UnionPay',
      visa: 'Visa',
    };

    return html`
      <div class="flex flex-wrap -m-xs">
        ${Object.entries(logos).map(([type, logo]) => {
          if (!typeToName[type]) return;
          const isChecked = this._value.includes(type);

          return html`
            <div
              data-testid=${type}
              class=${classMap({
                'm-xs rounded': true,
                'opacity-50 cursor-default': this.disabled,
                'cursor-pointer ring-primary-50 focus-within-ring-2': !this.disabled,
              })}
            >
              <label
                class=${classMap({
                  'overflow-hidden transition-colors flex rounded-s border': true,
                  'border-primary bg-primary-10 text-primary': isChecked && !this.readonly,
                  'border-contrast bg-contrast-5 text-secondary': isChecked && this.readonly,
                  'hover-text-body': isChecked && !this.disabled && !this.readonly,
                  'border-contrast-10': !isChecked,
                  'hover-border-primary': !isChecked && !this.disabled && !this.readonly,
                  'hover-text-primary': !isChecked && !this.disabled && !this.readonly,
                })}
              >
                <div class="h-s">${logo}</div>

                <div class="text-s font-medium mx-s my-auto leading-none">${typeToName[type]}</div>

                <input
                  type="checkbox"
                  class="sr-only"
                  ?disabled=${this.disabled}
                  ?readonly=${this.readonly}
                  ?checked=${isChecked}
                  @change=${(evt: Event) => {
                    if (this.readonly) return evt.preventDefault();

                    evt.stopPropagation();
                    const newValue = [...this._value];

                    if ((evt.currentTarget as HTMLInputElement).checked) {
                      newValue.push(type);
                    } else {
                      newValue.splice(newValue.indexOf(type), 1);
                    }

                    this._value = newValue;
                  }}
                />
              </label>
            </div>
          `;
        })}
      </div>
    `;
  }

  protected get _value(): string[] {
    return (super._value ?? []) as string[];
  }

  protected set _value(value: string[]) {
    super._value = value;
  }
}
