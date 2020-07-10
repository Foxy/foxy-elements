import '@vaadin/vaadin-text-field/vaadin-text-field';
import { html, property } from 'lit-element';
import { Translatable } from '../../../../mixins/translatable';
import { Choice } from '../../../private/choice/Choice';
import { ChoiceChangeEvent } from '../../../private/choice/ChoiceChangeEvent';
import { FrequencyInputChangeEvent, FrequencyInput } from './frequency-input';
import { parseDuration } from '../../../../utils/parse-duration';
import { Group } from '../../../private/group';

export class OffsetInputChangeEvent extends CustomEvent<string | undefined> {
  constructor(value: string | undefined) {
    super('change', { detail: value });
  }
}

export class OffsetInput extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'x-frequency-input': FrequencyInput,
      'x-choice': Choice,
      'x-group': Group,
    };
  }

  private readonly __items = ['none', 'custom'] as const;

  private get __choice() {
    return this.__items[this.value === undefined ? 0 : 1];
  }

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: String })
  public value?: string;

  @property({ type: String })
  public type: 'min' | 'max' = 'min';

  private get __hint() {
    const { count, units } = parseDuration(this.value ?? '');

    return this._i18n.t(`ndmod.${this.type}Hint`, {
      duration: this._i18n.t('duration', {
        count,
        units: this._i18n.t(units ?? '', { count }),
      }),
    });
  }

  public constructor() {
    super('customer-portal-settings');
  }

  public render() {
    return html`
      <x-group .header=${this._i18n.t(`ndmod.${this.type}`)}>
        <x-choice
          .value=${this.__choice}
          .items=${this.__items}
          .getText=${this.__getText.bind(this)}
          @change=${this.__handleChoiceChange}
        >
          ${this.__choice === this.__items[1]
            ? html`
                <div slot=${this.__items[1]} class="space-y-s">
                  <x-frequency-input
                    .value=${this.value}
                    .disabled=${this.disabled}
                    @change=${this.__handleNewValueChange}
                  >
                  </x-frequency-input>

                  <p class="text-s text-tertiary leading-s">${this.__hint}</p>
                </div>
              `
            : ''}
        </x-choice>
      </x-group>
    `;
  }

  private __handleNewValueChange(evt: FrequencyInputChangeEvent) {
    this.value = evt.detail;
    this.__sendChange();
  }

  private __handleChoiceChange(evt: ChoiceChangeEvent) {
    this.value = evt.detail === this.__items[0] ? undefined : '1w';
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new OffsetInputChangeEvent(this.value));
  }

  private __getText(value: string) {
    return this._i18n.t(`ndmod.${value}`);
  }
}
