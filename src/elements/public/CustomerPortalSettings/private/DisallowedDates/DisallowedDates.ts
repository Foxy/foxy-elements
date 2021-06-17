import '@polymer/iron-icon';
import '@polymer/iron-icons';
import { I18N, List, Skeleton } from '../../../../private';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { ButtonElement } from '@vaadin/vaadin-button';
import { DatePickerElement } from '@vaadin/vaadin-date-picker';
import { DisallowedDatesChangeEvent } from './DisallowedDatesChangeEvent';
import { ListChangeEvent } from '../../../../private/events';
import { ScopedElementsHost } from '@open-wc/scoped-elements/src/types';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Translatable } from '../../../../../mixins/translatable';
import { classMap } from '../../../../../utils/class-map';
import { parseDate } from '../../../../../utils/parse-date';
import { translateDate } from '../../../../../utils/translate-date';

export class DisallowedDates extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': ButtonElement,
      'vaadin-date-picker': DatePickerElement,
      'x-i18n': I18N,
      'x-list': List,
      'x-skeleton': Skeleton,
    };
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      value: { type: Array },
    };
  }

  public value: string[] = [];

  public disabled = false;

  private __startValue = '';

  private __endValue = '';

  public render(): TemplateResult {
    const isInputDisabled = this.value.length >= 20 || this.disabled || !this._isI18nReady;

    return html`
      <x-list
        data-testid="list"
        .value=${this.value}
        .disabled=${this.disabled || !this._isI18nReady}
        @change=${this.__handleListChange}
      >
        ${this.value.map((item, index) =>
          this._isI18nReady
            ? html`<span slot=${index} class="truncate">${translateDate(item, this.lang)}</span>`
            : html`<x-skeleton slot=${index}>${item}</x-skeleton>`
        )}

        <div class="sm-flex sm-items-end">
          <div class="grid grid-cols-2 gap-s">
            <vaadin-date-picker
              data-testid="start"
              .label=${this._t('ndmod.range_start').toString()}
              .value=${this.__startValue}
              .disabled=${isInputDisabled}
              .placeholder=${this._isI18nReady ? this._t('ndmod.select').toString() : ''}
              @change=${this.__handleStartValueChange}
            >
            </vaadin-date-picker>

            <vaadin-date-picker
              data-testid="end"
              .min=${this.__startValue}
              .label=${this._t('ndmod.range_end').toString()}
              .value=${this.__endValue}
              .disabled=${isInputDisabled || !this.__startValue}
              .placeholder=${this._isI18nReady ? this._t('ndmod.select').toString() : ''}
              clear-button-visible
              @change=${this.__handleEndValueChange}
            >
            </vaadin-date-picker>
          </div>

          <vaadin-button
            .disabled=${isInputDisabled || !this.__startValue}
            data-testid="submit"
            class="w-full mt-s sm-mt-0 sm-w-auto sm-ml-s"
            @click=${this.__submit}
          >
            <x-i18n
              .lang=${this.lang}
              .key="ndmod.add_${this.__endValue ? 'range' : 'single'}"
              .ns=${this.ns}
            >
            </x-i18n>
            <iron-icon icon="icons:add" slot="suffix"></iron-icon>
          </vaadin-button>
        </div>

        ${this.value.length > 0
          ? html`
              <x-i18n
                .ns=${this.ns}
                .lang=${this.lang}
                key="ndmod.add_range_hint"
                class=${classMap({
                  'block text-xs mt-xs': true,
                  'text-primary': this.value.length >= 20,
                  'text-tertiary': this.value.length < 20,
                })}
              >
              </x-i18n>
            `
          : ''}
      </x-list>
    `;
  }

  public updated(): void {
    const globalName = 'vaadin-date-picker';
    const scopedName = (this.constructor as typeof ScopedElementsHost).getScopedTagName(globalName);
    const pickers = this.shadowRoot!.querySelectorAll(scopedName);

    Array.from(pickers).forEach(picker => (picker as DatePickerElement).validate());
  }

  private __handleStartValueChange(evt: InputEvent) {
    evt.stopPropagation();
    this.__startValue = (evt.target as DatePickerElement).value;

    const end = parseDate(this.__endValue);
    const start = parseDate(this.__startValue)!;
    if (end && end.getTime() < start.getTime()) this.__endValue = '';

    this.requestUpdate();
  }

  private __handleEndValueChange(evt: InputEvent) {
    evt.stopPropagation();
    this.__endValue = (evt.target as DatePickerElement).value;
    this.requestUpdate();
  }

  private __submit() {
    if (this.__startValue && this.__endValue) {
      this.value = [...this.value, [this.__startValue, this.__endValue].join('..')];
    } else {
      this.value = [...this.value, this.__startValue];
    }

    this.__sendChange();
    this.__startValue = '';
    this.__endValue = '';
  }

  private __handleListChange(evt: ListChangeEvent) {
    this.value = evt.detail;
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new DisallowedDatesChangeEvent(this.value));
  }
}
