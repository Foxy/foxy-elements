import '@vaadin/vaadin-date-picker';
import { property, html } from 'lit-element';
import { Translatable } from '../../../../mixins/translatable';
import { ListChangeEvent, List } from '../../../private/list/List';

export class DisallowedDatesChangeEvent extends ListChangeEvent {}

export class DisallowedDates extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-date-picker': customElements.get('vaadin-date-picker'),
      'x-list': List,
    };
  }

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
        <vaadin-date-picker
          .disabled=${this.disabled}
          .placeholder=${this._i18n.t('ndmod.select')}
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
