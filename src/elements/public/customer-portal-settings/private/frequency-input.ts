import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-integer-field';
import { html, property } from 'lit-element';
import { live } from 'lit-html/directives/live';
import { Translatable } from '../../../../mixins/translatable';
import { Dropdown, DropdownChangeEvent } from '../../../private/dropdown/Dropdown';
import { parseDuration } from '../../../../utils/parse-duration';

export class FrequencyInputChangeEvent extends DropdownChangeEvent {}

export class FrequencyInput extends Translatable {
  public static readonly defaultValue = '1w';

  public static get scopedElements() {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-button': customElements.get('vaadin-button'),
      'x-dropdown': Dropdown,
    };
  }

  private readonly __items = ['y', 'm', 'w', 'd'] as const;

  private get __numericValue() {
    return parseDuration(this.value ?? '').count;
  }

  private get __unitsValue() {
    return parseDuration(this.value ?? '').units;
  }

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: String })
  public value = FrequencyInput.defaultValue;

  public render() {
    return html`
      <div class="grid grid-cols-2 gap-s">
        <vaadin-integer-field
          class="w-full"
          min="1"
          has-controls
          .value=${live(this.__numericValue.toString())}
          ?disabled=${this.disabled}
          @change=${this.__handleNumberChange}
        >
        </vaadin-integer-field>

        <x-dropdown
          .disabled=${this.disabled}
          .getText=${(v: string) => this._i18n.t(`${v}_plural`)}
          .items=${this.__items}
          .value=${live(this.__unitsValue)}
          @change=${this.__handleUnitsChange}
        >
        </x-dropdown>
      </div>
    `;
  }

  private __handleNumberChange(evt: InputEvent) {
    const value = (evt.target as HTMLInputElement).value;
    this.value = this.value.replace(String(this.__numericValue), value);
    this.__sendChange();
  }

  private __handleUnitsChange(evt: DropdownChangeEvent) {
    this.value = this.value.replace(String(this.__unitsValue), evt.detail);
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new FrequencyInputChangeEvent(this.value));
  }
}
