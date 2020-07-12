import '@vaadin/vaadin-text-field/vaadin-text-field';
import { html, property } from 'lit-element';
import { live } from 'lit-html/directives/live';
import { Translatable } from '../../../../mixins/translatable';
import { ChoiceChangeEvent } from '../../../private/events';
import { Choice } from '../../../private/index';

export class JSONataInputChangeEvent extends ChoiceChangeEvent {}

export class JSONataInput extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'x-choice': Choice,
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

  public render() {
    return html`
      <x-choice
        .value=${this.__choice}
        .items=${this.__items}
        .getText=${this.__getText.bind(this)}
        @change=${this.__handleChoiceChange}
      >
        ${this.__choice === this.__items[1]
          ? html`
              <div slot=${this.__items[1]} class="space-y-s">
                <p class="text-s text-tertiary leading-s">
                  ${this._i18n.t('jsonata.hint')}
                </p>

                <vaadin-text-field
                  class="w-full"
                  .disabled=${this.disabled}
                  .value=${live(this.value)}
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

  private __getText(value: string) {
    return this._i18n.t(['jsonata', value].join('.'));
  }
}
