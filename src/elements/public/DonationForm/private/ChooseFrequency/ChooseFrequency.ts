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
  label = this._t('choosefrequency.label');

  @property({ type: Boolean })
  isRecurring = false;

  @property({ type: String })
  value = '';

  @property({ type: Array })
  options = ['1w', '.5m', '1m', '3m', '6m', '1y'];

  @query('[name=recurring-value]')
  field?: any;

  friendlyFrequency: Record<string, string> = {
    '1w': this._t('choosefrequency.week'),
    '.5m': this._t('choosefrequency.halfmonth'),
    '1m': this._t('choosefrequency.month'),
    '3m': this._t('choosefrequency.threemonths'),
    '6m': this._t('choosefrequency.sixmonths'),
    '1y': this._t('choosefrequency.year'),
  };

  updated() {
    this.dispatchEvent(new Event('change'));
  }

  handleIsRecurring() {
    this.isRecurring = !this.isRecurring;
  }

  handleValue = {
    handleEvent: () => {
      this.value = this.field.value;
    },
  };

  render() {
    return html`
      <vaadin-checkbox value="${this.isRecurring}" @click="${this.handleIsRecurring}">
        <slot name="recurring">${this._t('choosefrequency.defaultRecurringLabel')}</slot>
      </vaadin-checkbox>
      <slot></slot>
      <vaadin-select
        @change=${this.handleValue}
        name="recurring-value"
        ?hidden="${!this.isRecurring}"
        label="${this.label}"
        value="${this.options[0]}"
      >
        <template>
          <vaadin-list-box>
            ${this.options.map(
              o => html`<vaadin-item value="${o}">${this.friendlyFrequency[o]}</vaadin-item>`
            )}
          </vaadin-list-box>
        </template>
      </vaadin-select>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'choose-frequency': ChooseFrequency;
  }
}
