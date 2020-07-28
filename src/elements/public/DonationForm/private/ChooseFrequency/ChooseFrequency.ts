import { Translatable } from '../../../../../mixins/translatable';
import { html, query, property } from 'lit-element';

import '@vaadin/vaadin-list-box/vaadin-list-box';
import '@vaadin/vaadin-checkbox/vaadin-checkbox';
import '@vaadin/vaadin-item/vaadin-item-mixin';
import '@vaadin/vaadin-select/vaadin-select';

export class ChooseFrequency extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-select': customElements.get('vaadin-select'),
      'vaadin-list-box': customElements.get('vaadin-list-box'),
      'vaadin-item': customElements.get('vaadin-item'),
      'vaadin-checkbox': customElements.get('vaadin-checkbox'),
    };
  }

  constructor() {
    super('donation-form');
  }

  @property({ type: String })
  public label = this._t('choosefrequency.label');

  @property({ type: Boolean })
  public isRecurring = false;

  @property({ type: String })
  public value = '';

  @property({ type: Array })
  public options = ['1w', '.5m', '1m', '3m', '6m', '1y'];

  @query('[name=recurring-value]')
  public field?: HTMLInputElement;

  private _friendlyFrequency: Record<string, string> = {
    '1w': this._t('choosefrequency.week'),
    '.5m': this._t('choosefrequency.halfmonth'),
    '1m': this._t('choosefrequency.month'),
    '3m': this._t('choosefrequency.threemonths'),
    '6m': this._t('choosefrequency.sixmonths'),
    '1y': this._t('choosefrequency.year'),
  };

  public updated() {
    this.dispatchEvent(new Event('change'));
  }

  private _handleIsRecurring() {
    this.isRecurring = !this.isRecurring;
  }

  private _handleValue = {
    handleEvent: () => {
      this.value = this.field!.value;
    },
  };

  public render() {
    return html`
      <vaadin-checkbox value="${this.isRecurring}" @click="${this._handleIsRecurring}">
        <slot name="recurring">${this._t('choosefrequency.defaultRecurringLabel')}</slot>
      </vaadin-checkbox>
      <slot></slot>
      <vaadin-select
        @change=${this._handleValue}
        name="recurring-value"
        ?hidden="${!this.isRecurring}"
        label="${this.label}"
        value="${this.options[0]}"
      >
        <template>
          <vaadin-list-box>
            ${this.options.map(
              o => html`<vaadin-item value="${o}">${this._friendlyFrequency[o]}</vaadin-item>`
            )}
          </vaadin-list-box>
        </template>
      </vaadin-select>
    `;
  }
}
