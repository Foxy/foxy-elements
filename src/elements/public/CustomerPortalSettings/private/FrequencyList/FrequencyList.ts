import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { html, property, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { ListChangeEvent } from '../../../../private/events';
import { I18N, List, Skeleton } from '../../../../private/index';
import { FrequencyInput } from '../FrequencyInput/FrequencyInput';
import { FrequencyInputChangeEvent } from '../FrequencyInput/FrequencyInputChangeEvent';
import { FrequencyListChangeEvent } from './FrequencyListChangeEvent';

export class FrequencyList extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': customElements.get('vaadin-button'),
      'x-frequency-input': FrequencyInput,
      'x-skeleton': Skeleton,
      'x-list': List,
      'x-i18n': I18N,
    };
  }

  private __newValue = FrequencyInput.defaultValue;

  @property({ type: Array })
  public value: string[] = [];

  @property({ type: Boolean })
  public disabled = false;

  public constructor() {
    super('customer-portal-settings');
  }

  public render(): TemplateResult {
    return html`
      <x-list
        data-testid="list"
        .value=${this.value}
        .disabled=${this.disabled || !this._isI18nReady}
        @change=${this.__handleListChange}
      >
        ${this.value.map((item, index) =>
          this._isI18nReady
            ? html`<span slot=${index}>${this.__getText(item)}</span>`
            : html`<x-skeleton slot=${index}>${item}</x-skeleton>`
        )}

        <div class="space-y-s md:space-y-0 md:space-x-s w-full md:flex">
          <x-frequency-input
            data-testid="input"
            .lang=${this.lang}
            .value=${this.__newValue}
            .disabled=${this.disabled || !this._isI18nReady}
            @change=${this.__handleNewValueChange}
          >
          </x-frequency-input>

          <vaadin-button
            data-testid="button"
            class="w-full md:w-auto"
            .disabled=${this.disabled || !this._isI18nReady}
            @click=${this.__handleSubmit}
          >
            <x-i18n .ns=${this.ns} .lang=${this.lang} key="fmod.add"></x-i18n>
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
    return this._t('duration', { count, units: this._t(units, { count }) });
  }
}
