import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-date-picker';
import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { ListChangeEvent } from '../../../../private/events';
import { I18N, List, Skeleton } from '../../../../private/index';
import { DisallowedDatesChangeEvent } from './DisallowedDatesChangeEvent';

export class DisallowedDates extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-date-picker': customElements.get('vaadin-date-picker'),
      'x-skeleton': Skeleton,
      'x-i18n': I18N,
      'x-list': List,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      value: { type: Array },
      disabled: { type: Boolean },
    };
  }

  public value: string[] = [];

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
