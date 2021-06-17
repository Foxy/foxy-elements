import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { I18N } from '../I18N/I18N';
import { MonthdayPickerChangeEvent } from './MonthdayPickerChangeEvent';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Translatable } from '../../../mixins/translatable';
import { concatTruthy } from '../../../utils/concat-truthy';

export class MonthdayPicker extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-i18n': I18N,
    };
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      value: { type: Array },
    };
  }

  public disabled = false;

  public value: number[] = [];

  protected static readonly _allDays = Array.from(new Array(31), (_, i) => i + 1);

  public render(): TemplateResult {
    const translatedDays = MonthdayPicker._allDays.map(day => {
      try {
        return day.toLocaleString(this.lang, { minimumIntegerDigits: 2 });
      } catch {
        return day.toString();
      }
    });

    return html`
      <div class="space-y-s">
        <div
          class="flex flex-wrap -mx-xs -mb-xs"
          style="max-width: 364px; font-feature-settings: 'tnum' 1;"
        >
          ${MonthdayPicker._allDays.map((day, index) => {
            return html`
              <label class=${this._getLabelClass(day)}>
                ${translatedDays[index]}
                <input
                  type="checkbox"
                  class="sr-only"
                  ?disabled=${this.disabled}
                  ?checked=${this.value.includes(day)}
                  @change=${(evt: Event) => this._handleChange(evt, day)}
                />
              </label>
            `;
          })}
        </div>

        ${concatTruthy(
          this.value.length > 0 &&
            html`
              <p class="text-s text-tertiary leading-s">
                <x-i18n key="monthday-picker.hint" .opts=${{ days: this.value }} .lang=${this.lang}>
                </x-i18n>

                ${concatTruthy(
                  [29, 30, 31].some(day => this.value.includes(day)) &&
                    html`<x-i18n key="monthday-picker.warning" .lang=${this.lang}></x-i18n>`
                )}
              </p>
            `
        )}
      </div>
    `;
  }

  protected _getLabelClass(day: number): string {
    let base =
      'flex items-center justify-center m-xs p-s rounded text-m font-medium transition duration-200 sm-p-0 sm-h-m sm-w-l ';

    if (!this.value.includes(day)) base += 'bg-contrast-5 ';

    if (this._isI18nReady && !this.disabled) {
      base += 'cursor-pointer ';
      base += this.value.includes(day) ? 'text-base ' : 'hover-bg-primary-10 ';

      if (day < 29) {
        base += 'focus-within-shadow-outline ';
        base += this.value.includes(day) ? 'bg-primary' : 'text-body';
      } else {
        base += 'focus-within-shadow-outline-error ';
        base += this.value.includes(day) ? 'bg-error' : 'text-error';
      }
    } else {
      base += 'text-transparent ';
      if (this.value.includes(day)) base += day < 29 ? 'bg-primary-50' : 'bg-error-10';
    }

    return base;
  }

  protected _handleChange(evt: Event, day: number): void {
    evt.stopPropagation();
    this._toggle(day);
    this._sendChange();
  }

  protected _sendChange(): void {
    this.dispatchEvent(new MonthdayPickerChangeEvent(this.value));
  }

  protected _toggle(value: number): void {
    const index = this.value.indexOf(value);
    this.value = index === -1 ? [...this.value, value] : this.value.filter((_, i) => i !== index);
  }
}
