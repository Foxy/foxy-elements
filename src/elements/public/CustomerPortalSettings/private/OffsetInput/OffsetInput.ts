import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import { html, property, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { parseDuration } from '../../../../../utils/parse-duration';
import { ChoiceChangeEvent } from '../../../../private/events';
import { Choice, Group, I18N } from '../../../../private/index';
import { FrequencyInput } from '../FrequencyInput/FrequencyInput';
import { FrequencyInputChangeEvent } from '../FrequencyInput/FrequencyInputChangeEvent';
import { OffsetInputChangeEvent } from './OffsetInputChangeEvent';

export class OffsetInput extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'x-frequency-input': FrequencyInput,
      'x-choice': Choice,
      'x-group': Group,
      'x-i18n': I18N,
    };
  }

  private readonly __items = ['none', 'custom'] as const;

  private get __choice() {
    return this.__items[!this.value ? 0 : 1];
  }

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: String })
  public value?: string;

  @property({ type: String })
  public type: 'min' | 'max' = 'min';

  private get __hint() {
    if (!this._isI18nReady) return '';
    const { count, units } = parseDuration(this.value ?? '');

    return this._t(`ndmod.${this.type}Hint`, {
      duration: this._t('duration', {
        count,
        units: this._t(units ?? '', { count }),
      }),
    });
  }

  public constructor() {
    super('customer-portal-settings');
  }

  public render(): TemplateResult {
    return html`
      <x-group>
        <x-i18n slot="header" .ns=${this.ns} .lang=${this.lang} key=${`ndmod.${this.type}`}>
        </x-i18n>

        <x-choice
          data-testid="choice"
          .disabled=${this.disabled}
          .value=${this.__choice}
          .items=${this.__items}
          @change=${this.__handleChoiceChange}
        >
          <x-i18n slot="none-label" .ns=${this.ns} .lang=${this.lang} key="ndmod.none"></x-i18n>
          <x-i18n slot="custom-label" .ns=${this.ns} .lang=${this.lang} key="ndmod.custom"></x-i18n>

          ${this.__choice === this.__items[1]
            ? html`
                <div slot=${this.__items[1]} class="space-y-s">
                  <x-frequency-input
                    data-testid="input"
                    .value=${this.value!}
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
    this.value = evt.detail as string;
    this.__sendChange();
  }

  private __handleChoiceChange(evt: ChoiceChangeEvent) {
    this.value = evt.detail === this.__items[0] ? undefined : '1w';
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new OffsetInputChangeEvent(this.value));
  }
}
