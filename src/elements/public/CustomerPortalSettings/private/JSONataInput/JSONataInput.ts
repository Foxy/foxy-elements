import '@polymer/iron-icon';
import '@polymer/iron-icons';
import '@vaadin/vaadin-text-field/vaadin-text-field';

import { Choice, I18N } from '../../../../private';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { ChoiceChangeEvent } from '../../../../private/events';
import { JSONataInputChangeEvent } from './JSONataInputChangeEvent';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Translatable } from '../../../../../mixins/translatable';
import debounce from 'lodash-es/debounce';
import jsonata from 'jsonata';

const DEBOUNCE_WAIT = 275;

export class JSONataInput extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'iron-icon': customElements.get('iron-icon'),
      'x-choice': Choice,
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      value: { type: String },
    };
  }

  public disabled = false;

  public value = '*';

  private __errorMessage = '';

  private readonly __items = ['all', 'some'] as const;

  private readonly __handleNewValueChange: (value: string) => void = debounce(value => {
    try {
      jsonata(value).evaluate({});
      this.value = value;
      this.__errorMessage = '';
      this.__sendChange();
    } catch (err) {
      this.__errorMessage = err.message;
    }

    this.requestUpdate();
  }, DEBOUNCE_WAIT);

  public render(): TemplateResult {
    const linkStyle =
      'pl-xs text-primary rounded font-medium cursor-pointer transition duration-200 focus-outline-none focus-shadow-outline hover-underline';

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
              <div slot=${this.__items[1]} class="space-y-s pb-m">
                <x-i18n
                  .ns=${this.ns}
                  .lang=${this.lang}
                  key="jsonata.hint"
                  class="block font-lumo text-s text-tertiary leading-s"
                >
                  <a
                    target="_blank"
                    class=${linkStyle}
                    href="https://docs.jsonata.org"
                    rel="noopener noreferrer"
                  >
                    JSONata <iron-icon icon="icons:open-in-new" class="icon-inline"></iron-icon>
                  </a>
                  <a
                    target="_blank"
                    class=${linkStyle}
                    href="https://api.foxycart.com/rels/subscription"
                    rel="noopener noreferrer"
                  >
                    hAPI subscription
                    <iron-icon icon="icons:open-in-new" class="icon-inline"></iron-icon>
                  </a>
                </x-i18n>

                <vaadin-text-field
                  class="w-full"
                  data-testid="input"
                  .errorMessage=${this.__errorMessage}
                  .disabled=${this.disabled || !this._isI18nReady}
                  .invalid=${this.__errorMessage.length > 0}
                  .value=${this._isI18nReady ? this.value : ''}
                  @keydown=${this.__stopNavigation}
                  @change=${(evt: Event) => evt.stopPropagation()}
                  @input=${(evt: InputEvent) =>
                    this.__handleNewValueChange((evt.target as HTMLInputElement).value)}
                >
                </vaadin-text-field>
              </div>
            `
          : ''}
      </x-choice>
    `;
  }

  private get __choice() {
    return this.__items[this.value === '*' ? 0 : 1];
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
