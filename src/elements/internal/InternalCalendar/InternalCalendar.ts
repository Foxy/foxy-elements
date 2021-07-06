import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { ThemeableMixin } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { parseDate } from '../../../utils/parse-date';
import { serializeDate } from '../../../utils/serialize-date';

export class InternalCalendar extends ThemeableMixin(LitElement) {
  static get properties(): PropertyDeclarations {
    return {
      checkAvailability: { attribute: false },
      readonly: { type: Boolean, reflect: true },
      disabled: { type: Boolean, reflect: true },
      value: { type: String },
      start: { type: String },
      lang: { type: String },
    };
  }

  checkAvailability: (date: Date) => boolean = () => true;

  readonly = false;

  disabled = false;

  value = '';

  start = '';

  lang = '';

  render(): TemplateResult {
    const thisMonth = new Date(this.__startAsDate ?? this.__valueAsDate ?? Date.now());
    const prevMonth = new Date(thisMonth);
    const nextMonth = new Date(thisMonth);
    const lang = this.lang || navigator.language;

    prevMonth.setMonth(prevMonth.getMonth() - 1);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    return html`
      <div class="text-m text-body font-lumo leading-m">
        <div class="grid p-xs" style="grid-template: auto / max-content auto max-content">
          <vaadin-button
            data-testid="prev"
            aria-label=${prevMonth.toLocaleString(lang, { year: 'numeric', month: 'long' })}
            theme="icon tertiary"
            class="px-xs"
            ?disabled=${this.disabled}
            @click=${this.__handlePrevButtonClick}
          >
            <iron-icon icon="icons:chevron-left"></iron-icon>
          </vaadin-button>

          <span
            data-testid="month"
            class=${classMap({
              'text-center self-center font-medium': true,
              'text-disabled': this.disabled,
            })}
          >
            ${thisMonth.toLocaleDateString(lang, { month: 'long', year: 'numeric' })}
          </span>

          <vaadin-button
            data-testid="next"
            aria-label=${nextMonth.toLocaleString(lang, { year: 'numeric', month: 'long' })}
            theme="icon tertiary"
            class="px-xs"
            ?disabled=${this.disabled}
            @click=${this.__handleNextButtonClick}
          >
            <iron-icon icon="icons:chevron-right"></iron-icon>
          </vaadin-button>
        </div>

        ${this.__renderMonth(thisMonth.getMonth(), thisMonth.getFullYear())}
      </div>
    `;
  }

  private get __valueAsDate(): Date | null {
    return parseDate(this.value);
  }

  private set __valueAsDate(value: Date | null) {
    this.value = value ? serializeDate(value) : '';
  }

  private get __startAsDate(): Date | null {
    return parseDate(this.start);
  }

  private set __startAsDate(value: Date | null) {
    this.start = value ? serializeDate(value) : '';
  }

  private __renderMonth(month: number, year: number) {
    const lang = this.lang || navigator.language;
    const date = new Date(year, month, 1, 0, 0, 0, 0);
    const items: TemplateResult[] = [];

    for (let i = 0; i < 7; ++i) {
      const weekdayDate = new Date();
      while (weekdayDate.getDay() !== i) weekdayDate.setDate(weekdayDate.getDate() + 1);

      items.push(html`
        <span
          class=${classMap({
            'self-center text-xxs uppercase font-medium tracking-wider': true,
            'text-secondary': !this.disabled,
            'text-disabled': this.disabled,
          })}
        >
          ${weekdayDate.toLocaleString(lang, { weekday: 'short' })}
        </span>
      `);
    }

    while (date.getMonth() === month) {
      const checked =
        date.getFullYear() === this.__valueAsDate?.getFullYear() &&
        date.getMonth() === this.__valueAsDate?.getMonth() &&
        date.getDate() === this.__valueAsDate?.getDate();

      items.push(html`
        <div style="grid-column: ${date.getDay() + 1}" data-testclass="day-of-month">
          ${this.__renderDate(date.getDate(), month, year, checked)}
        </div>
      `);

      date.setDate(date.getDate() + 1);
    }

    return html`
      <form
        data-testid="grid"
        class="grid gap-s p-s text-center"
        style="grid-template: auto / repeat(7, 1fr);"
      >
        ${items}
      </form>
    `;
  }

  private __renderDate(date: number, month: number, year: number, checked = false) {
    const disabled =
      this.disabled || this.readonly || !this.checkAvailability(new Date(year, month, date));

    return html`
      <label
        class=${classMap({
          'font-tnum select-none relative flex h-m items-center justify-center rounded': true,
          'cursor-pointer focus-within-ring-2 focus-within-ring-primary-50': !disabled,
          'bg-contrast-5 hover-bg-contrast-10': !checked && !disabled,
          'bg-primary text-primary-contrast': checked && !disabled,
          'border border-dashed border-contrast-20 text-disabled': !checked && disabled,
          'border border-dashed border-primary text-primary': checked && disabled,
        })}
      >
        <input
          name="date"
          type="radio"
          value=${date}
          class="sr-only"
          ?disabled=${this.readonly || this.disabled || disabled}
          @change=${() => {
            this.__valueAsDate = new Date(year, month, date);
            this.dispatchEvent(new CustomEvent('change'));
          }}
        />

        ${date}
      </label>
    `;
  }

  private __handlePrevButtonClick() {
    const currentStart = new Date(this.start ?? Date.now());
    this.__startAsDate = new Date(currentStart.setMonth(currentStart.getMonth() - 1));
  }

  private __handleNextButtonClick() {
    const currentStart = new Date(this.start ?? Date.now());
    this.__startAsDate = new Date(currentStart.setMonth(currentStart.getMonth() + 1));
  }
}
