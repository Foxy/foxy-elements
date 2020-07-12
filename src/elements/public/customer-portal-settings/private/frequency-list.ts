import { property, html } from 'lit-element';
import { Translatable } from '../../../../mixins/translatable';
import { List } from '../../../private/list/List';
import { ListChangeEvent } from '../../../private/list/ListChangeEvent';
import { FrequencyInput, FrequencyInputChangeEvent } from './frequency-input';

export class FrequencyListChangeEvent extends ListChangeEvent {}

export class FrequencyList extends Translatable {
  public static get scopedElements() {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': customElements.get('vaadin-button'),
      'x-frequency-input': FrequencyInput,
      'x-list': List,
    };
  }

  private __newValue = FrequencyInput.defaultValue;

  @property({ type: Object })
  public value: string[] = [];

  @property({ type: Boolean })
  public disabled = false;

  public constructor() {
    super('customer-portal-settings');
  }

  public render() {
    return html`
      <x-list
        .value=${this.value}
        .disabled=${this.disabled}
        .getText=${this.__getText.bind(this)}
        @change=${this.__handleListChange}
      >
        <div class="space-y-s md:space-y-0 md:space-x-s w-full md:flex">
          <x-frequency-input
            .value=${this.__newValue}
            .disabled=${this.disabled}
            @change=${this.__handleNewValueChange}
          >
          </x-frequency-input>

          <vaadin-button
            class="w-full md:w-auto"
            .disabled=${this.disabled}
            @click=${this.__handleSubmit}
          >
            ${this._i18n.t('origins.add')}
            <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
          </vaadin-button>
        </div>
      </x-list>
    `;
  }

  private __handleNewValueChange(evt: FrequencyInputChangeEvent) {
    this.__newValue = evt.detail;
  }

  private __handleListChange(evt: ListChangeEvent) {
    this.value = evt.detail;
    this.__sendChange();
  }

  private __handleSubmit() {
    this.value = [...this.value, this.__newValue];
    this.__newValue = FrequencyInput.defaultValue;
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new FrequencyListChangeEvent(this.value));
  }

  private __getText(value: string) {
    const units = value[value.length - 1];
    const count = parseInt(value.replace(units, ''));
    return this._i18n.t('duration', { count, units: this._i18n.t(units, { count }) });
  }
}
