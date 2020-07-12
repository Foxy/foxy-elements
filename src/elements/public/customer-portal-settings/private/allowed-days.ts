import '@vaadin/vaadin-text-field/vaadin-text-field';
import { html, property } from 'lit-element';
import { live } from 'lit-html/directives/live';
import { Translatable } from '../../../../mixins/translatable';
import { Choice } from '../../../private/choice/Choice';
import { ChoiceChangeEvent } from '../../../private/choice/ChoiceChangeEvent';
import { MonthdayPicker } from '../../../private/monthday-picker/MonthdayPicker';
import { MonthdayPickerChangeEvent } from '../../../private/monthday-picker/MonthdayPickerChangeEvent';
import { WeekdayPicker, WeekdayPickerChangeEvent } from '../../../private/weekday-picker';

interface Rule {
  type: 'day' | 'month';
  days: number[];
}

export class AllowedDaysChangeEvent extends CustomEvent<Rule | undefined> {
  constructor(value: Rule | undefined) {
    super('change', { detail: value });
  }
}

export class AllowedDays extends Translatable {
  public static get scopedElements() {
    return {
      'x-monthday-picker': MonthdayPicker,
      'x-weekday-picker': WeekdayPicker,
      'x-choice': Choice,
    };
  }

  private readonly __items = ['all', 'month', 'day'] as const;

  private get __choice() {
    return this.__items[this.value === undefined ? 0 : this.value.type === 'month' ? 1 : 2];
  }

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Object })
  public value?: Rule;

  public constructor() {
    super('customer-portal-settings');
  }

  public render() {
    return html`
      <x-choice
        .value=${this.__choice}
        .items=${this.__items}
        .getText=${this.__getText.bind(this)}
        @change=${this.__handleChoiceChange}
      >
        ${this.value?.type === 'month'
          ? html`
              <x-monthday-picker
                slot="month"
                .disabled=${this.disabled}
                .value=${live(this.value.days)}
                @change=${this.__handleNewValueChange}
              >
              </x-monthday-picker>
            `
          : this.value?.type === 'day'
          ? html`
              <x-weekday-picker
                slot="day"
                .disabled=${this.disabled}
                .value=${live(this.value.days)}
                @change=${this.__handleNewValueChange}
              >
              </x-weekday-picker>
            `
          : ''}
      </x-choice>
    `;
  }

  private __handleNewValueChange(evt: WeekdayPickerChangeEvent | MonthdayPickerChangeEvent) {
    this.value!.days = evt.detail;
    this.__sendChange();
  }

  private __handleChoiceChange(evt: ChoiceChangeEvent) {
    this.value =
      evt.detail === this.__items[0]
        ? undefined
        : evt.detail === this.__items[1]
        ? { type: 'month', days: [] }
        : { type: 'day', days: [] };

    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new AllowedDaysChangeEvent(this.value));
  }

  private __getText(value: string) {
    return this._i18n.t(`ndmod.${value}`);
  }
}
