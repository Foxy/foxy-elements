import { html } from 'lit-element';
import { concatTruthy } from '../../../utils/concat-truthy';
import { translateWeekday } from '../../../utils/translate-weekday';
import { MonthdayPicker } from '../MonthdayPicker/MonthdayPicker';
import { WeekdayPickerChangeEvent } from './WeekdayPickerChangeEvent';

export class WeekdayPicker extends MonthdayPicker {
  protected static readonly _allDays = new Array(7).fill(0).map((_, i) => i);

  protected _getLabelClass(day: number) {
    let base = 'flex items-center justify-center m-xs h-m w-xl rounded font-medium ';
    base += this.value.includes(day) ? 'text-base bg-primary' : 'bg-contrast-5 text-primary';
    return base;
  }

  public render() {
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
                <x-i18n key="weekday-picker.hint" .lang=${this.lang} .opts=${{ days: this.value }}>
                </x-i18n>
              </p>
            `
        )}
      </div>
    `;
  }

  protected _sendChange() {
    this.dispatchEvent(new WeekdayPickerChangeEvent(this.value));
  }
}
