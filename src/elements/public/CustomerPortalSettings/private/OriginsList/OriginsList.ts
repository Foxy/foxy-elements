import '@vaadin/vaadin-button';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import { html, query, property } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { ListChangeEvent } from '../../../../private/events';
import { Group, List } from '../../../../private/index';
import { OriginsListChangeEvent } from './OriginsListChangeEvent';

export class OriginsList extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-button': customElements.get('vaadin-button'),
      'iron-icon': customElements.get('iron-icon'),
      'x-group': Group,
      'x-list': List,
    };
  }

  @query('[name=new-value]')
  private __newValueInput!: HTMLInputElement;

  @property({ type: Array })
  public value: string[] = [];

  @property({ type: Boolean })
  public disabled = false;

  constructor() {
    super('customer-portal-settings');
  }

  public render() {
    return html`
      <x-group frame>
        <x-list
          data-testid="list"
          .disabled=${this.disabled}
          .value=${this.value}
          @change=${this.__handleChange}
        >
          <div
            class="flex flex-col space-y-s sm:items-center sm:space-y-0 sm:flex-row sm:space-x-s"
          >
            <vaadin-text-field
              data-testid="input"
              name="new-value"
              pattern="https?://(w*.?)*(:d*)?"
              placeholder="https://foxy.io"
              error-message=${this._i18n.t('origins.invalid').toString()}
              .disabled=${this.disabled}
              @keypress=${(evt: KeyboardEvent) => evt.key === 'Enter' && this.__submit()}
              @change=${(evt: InputEvent) => evt.stopPropagation()}
            >
            </vaadin-text-field>

            <vaadin-button data-testid="button" .disabled=${this.disabled} @click=${this.__submit}>
              ${this._i18n.t('origins.add')}
              <iron-icon icon="lumo:plus" slot="suffix"></iron-icon>
            </vaadin-button>
          </div>
        </x-list>
      </x-group>
    `;
  }

  private __sendChange() {
    this.dispatchEvent(new OriginsListChangeEvent(this.value));
  }

  private __submit() {
    if (this.__newValueInput.value.trim().length === 0) return;
    if (!this.__newValueInput.checkValidity()) return;

    this.value = [...this.value, this.__newValueInput.value];
    this.__sendChange();
    this.__reset();
  }

  private __reset() {
    this.__newValueInput.value = '';
  }

  private __handleChange(evt: ListChangeEvent) {
    this.value = evt.detail;
    this.__sendChange();
  }
}
