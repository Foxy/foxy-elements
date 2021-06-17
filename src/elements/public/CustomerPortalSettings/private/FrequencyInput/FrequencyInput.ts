import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-integer-field';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { Dropdown } from '../../../../private';
import { DropdownChangeEvent } from '../../../../private/events';
import { FrequencyInputChangeEvent } from './FrequencyInputChangeEvent';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { Translatable } from '../../../../../mixins/translatable';
import { parseDuration } from '../../../../../utils/parse-duration';

export class FrequencyInput extends Translatable {
  public static readonly defaultValue = '1w';

  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-button': customElements.get('vaadin-button'),
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'x-dropdown': Dropdown,
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

  public value = FrequencyInput.defaultValue;

  private readonly __items = ['y', 'm', 'w', 'd'] as const;

  public constructor() {
    super('customer-portal-settings');
  }

  public render(): TemplateResult {
    return html`
      <div class="grid grid-cols-2 gap-s">
        <vaadin-integer-field
          data-testid="value"
          class="w-full"
          min="1"
          has-controls
          .value=${this._isI18nReady ? this.__numericValue : ''}
          .disabled=${this.disabled}
          @change=${this.__handleNumberChange}
        >
        </vaadin-integer-field>

        <x-dropdown
          data-testid="units"
          .disabled=${this.disabled}
          .getText=${(v: string) => (this._isI18nReady ? this._t(`${v}_plural`) : '')}
          .items=${this.__items}
          .value=${this._isI18nReady ? this.__unitsValue : ''}
          @change=${this.__handleUnitsChange}
        >
        </x-dropdown>
      </div>
    `;
  }

  private get __numericValue() {
    return parseDuration(this.value ?? '').count;
  }

  private get __unitsValue() {
    return parseDuration(this.value ?? '').units;
  }

  private __handleNumberChange(evt: Event) {
    evt.stopPropagation();
    const value = (evt.target as HTMLInputElement).value;
    this.value = this.value.replace(String(this.__numericValue), value);
    this.__sendChange();
  }

  private __handleUnitsChange(evt: DropdownChangeEvent) {
    this.value = this.value.replace(String(this.__unitsValue), evt.detail as string);
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new FrequencyInputChangeEvent(this.value));
  }
}
