import '@vaadin/vaadin-date-picker';
import { property, html } from 'lit-element';
import { ListChangeEvent } from '../../../../private/events';
import { List, I18N, Skeleton } from '../../../../private/index';
import { DisallowedDatesChangeEvent } from './DisallowedDatesChangeEvent';
import { Translatable } from '../../../../../mixins/translatable';

export class DisallowedDates extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-date-picker': customElements.get('vaadin-date-picker'),
      'x-skeleton': Skeleton,
      'x-i18n': I18N,
      'x-list': List,
    };
  }

  @property({ type: Array })
  public value: string[] = [];

  @property({ type: Boolean })
  public disabled = false;

  public constructor() {
    super('customer-portal-settings');
  }

  public render() {
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

        <vaadin-date-picker
          data-testid="input"
          .disabled=${this.disabled || !this._isI18nReady}
          .placeholder=${this._isI18nReady ? this._t('ndmod.select') : ''}
          @change=${this.__handleNewValueChange}
        >
        </vaadin-date-picker>
      </x-list>
    `;
  }

  private __getText(value: string) {
    return new Date(value).toLocaleDateString(this.lang, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private __handleNewValueChange(evt: InputEvent) {
    evt.stopPropagation();
    const target = evt.target as HTMLInputElement;
    if (!target.value) return;

    const [year, month, day] = target.value.split('-').map(v => parseInt(v, 10));
    const date = new Date(year, month - 1, day);

    this.value = [...this.value, date.toISOString()];
    this.__sendChange();

    setTimeout(() => (target.value = ''), 0);
  }

  private __handleListChange(evt: ListChangeEvent) {
    this.value = evt.detail;
    this.__sendChange();
  }

  private __sendChange() {
    this.dispatchEvent(new DisallowedDatesChangeEvent(this.value));
  }
}
