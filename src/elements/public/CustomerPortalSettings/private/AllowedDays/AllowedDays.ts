import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';

import {
  ChoiceChangeEvent,
  MonthdayPickerChangeEvent,
  WeekdayPickerChangeEvent,
} from '../../../../private/events';

import { Choice, I18N, MonthdayPicker, WeekdayPicker } from '../../../../private/index';
import { AllowedDaysChangeEvent } from './AllowedDaysChangeEvent';

export interface Rule {
  type: 'day' | 'month';
  days: number[];
}

export class AllowedDays extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-monthday-picker': MonthdayPicker,
      'x-weekday-picker': WeekdayPicker,
      'x-choice': Choice,
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      value: { type: Object },
    };
  }

  public disabled = false;

  public value?: Rule;

  private readonly __items = ['all', 'month', 'day'] as const;

  public constructor() {
    super('customer-portal-settings');
  }

  public render(): TemplateResult {
    return html`
      <x-choice
        data-testid="choice"
        .value=${this.value?.type ?? 'all'}
        .items=${this.__items}
        .disabled=${this.disabled}
        @change=${this.__handleChoiceChange}
      >
        <x-i18n slot="all-label" key="ndmod.all" .ns=${this.ns} .lang=${this.lang}></x-i18n>
        <x-i18n slot="month-label" key="ndmod.month" .ns=${this.ns} .lang=${this.lang}></x-i18n>
        <x-i18n slot="day-label" key="ndmod.day" .ns=${this.ns} .lang=${this.lang}></x-i18n>

        ${this.value?.type === 'month'
          ? html`
              <x-monthday-picker
                slot="month"
                class="mb-m"
                data-testid="monthday-picker"
                .lang=${this.lang}
                .disabled=${this.disabled || !this._isI18nReady}
                .value=${this.value.days}
                @change=${this.__handleNewValueChange}
              >
              </x-monthday-picker>
            `
          : this.value?.type === 'day'
          ? html`
              <x-weekday-picker
                slot="day"
                class="mb-m"
                data-testid="weekday-picker"
                .lang=${this.lang}
                .disabled=${this.disabled || !this._isI18nReady}
                .value=${this.value.days}
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
}
