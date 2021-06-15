import { TemplateResult, html } from 'lit-element';
import { concatTruthy } from '../../../utils/concat-truthy';
import { translateWeekday } from '../../../utils/translate-weekday';
import { MonthdayPicker } from '../MonthdayPicker/MonthdayPicker';
import { WeekdayPickerChangeEvent } from './WeekdayPickerChangeEvent';

export class WeekdayPicker extends MonthdayPicker {
  protected static readonly _allDays = new Array(7).fill(0).map((_, i) => i);

  public render(): TemplateResult {
    return html`
      <div class="space-y-s">
        <div class="flex flex-wrap -mx-xs -mb-xs text-m uppercase">
          ${WeekdayPicker._allDays.map(day => {
            return html`
              <label class=${this._getLabelClass(day)}>
                ${translateWeekday(day, this.lang, 'short')}
                <input
                  type="checkbox"
                  class="sr-only"
                  ?disabled=${this.disabled || !this._isI18nReady}
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
                <x-i18n key="weekday-picker.hint" .lang=${this.lang} .opts=${{ days: this.value }}>
                </x-i18n>
              </p>
            `
        )}
      </div>
    `;
  }

  protected _getLabelClass(day: number): string {
    let base =
      'flex items-center justify-center m-xs h-m w-xl rounded font-medium transition duration-200 ';

    if (this._isI18nReady && !this.disabled) {
      base += 'cursor-pointer focus-within-shadow-outline ';
      base += this.value.includes(day)
        ? 'text-base bg-primary'
        : 'bg-contrast-5 hover-bg-contrast-10 text-body';
    } else {
      base += 'text-transparent ';
      base += this.value.includes(day) ? 'bg-primary-50' : 'bg-contrast-5';
    }

    return base;
  }

  protected _sendChange(): void {
    this.dispatchEvent(new WeekdayPickerChangeEvent(this.value));
  }
}
