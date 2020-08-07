import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import { html, property, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { ChoiceChangeEvent } from '../../../../private/events';
import { Choice, I18N } from '../../../../private/index';
import { JSONataInputChangeEvent } from './JSONataInputChangeEvent';

export class JSONataInput extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'x-choice': Choice,
      'x-i18n': I18N,
    };
  }

  private readonly __items = ['all', 'some'] as const;

  private get __choice() {
    return this.__items[this.value === '*' ? 0 : 1];
  }

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: String })
  public value = '*';

  public constructor() {
    super('customer-portal-settings');
  }

  public render(): TemplateResult {
    return html`
      <x-choice
        data-testid="choice"
        .disabled=${this.disabled || !this._isI18nReady}
        .value=${this.__choice}
        .items=${this.__items}
        @change=${this.__handleChoiceChange}
      >
        <x-i18n slot="all-label" .ns=${this.ns} .lang=${this.lang} key="jsonata.all"></x-i18n>
        <x-i18n slot="some-label" .ns=${this.ns} .lang=${this.lang} key="jsonata.some"></x-i18n>

        ${this.__choice === this.__items[1]
          ? html`
              <div slot=${this.__items[1]} class="space-y-s">
                <p class="text-s text-tertiary leading-s">
                  <x-i18n .ns=${this.ns} .lang=${this.lang} key="jsonata.hint"></x-i18n>
                </p>

                <vaadin-text-field
                  class="w-full"
                  data-testid="input"
                  .disabled=${this.disabled || !this._isI18nReady}
                  .value=${this._isI18nReady ? this.value : ''}
                  @keydown=${this.__stopNavigation}
                  @change=${(evt: Event) => evt.stopPropagation()}
                  @input=${this.__handleNewValueChange}
                >
                </vaadin-text-field>
              </div>
            `
          : ''}
      </x-choice>
    `;
  }

  private __handleNewValueChange(evt: InputEvent) {
    this.value = (evt.target as HTMLInputElement).value;
    this.__sendChange();
  }

  private __handleChoiceChange(evt: ChoiceChangeEvent) {
    this.value = evt.detail === this.__items[0] ? '*' : '$contains(frequency, "w")';
    this.__sendChange();
  }

  private __stopNavigation(evt: KeyboardEvent) {
    if (evt.key.startsWith('Arrow')) evt.stopPropagation();
  }

  private __sendChange() {
    this.dispatchEvent(new JSONataInputChangeEvent(this.value));
  }
}
