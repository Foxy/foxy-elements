import { Translatable } from '../../../../../mixins/translatable';
import { html, property } from 'lit-element';

export class ChooseFrequency extends Translatable {
  @property({ type: Array })
  label = this._i18n.t('Choose the frequency');

  @property({ type: Boolean })
  isRecurring = false;

  @property({ type: Array })
  options = ['1w', '.5m', '1m', '3m', '6m', '1y'];

  friendlyFrequency: Record<string, string> = {
    '1w': this._i18n.t('every week'),
    '.5m': this._i18n.t('twice a month'),
    '1m': this._i18n.t('every month'),
    '3m': this._i18n.t('every 3 months'),
    '6m': this._i18n.t('every 6 months'),
    '1y': this._i18n.t('every year'),
  };

  handleIsRecurring() {
    this.isRecurring = !this.isRecurring;
  }

  render() {
    return html`
      <vaadin-checkbox value="${this.isRecurring}" @click="${this.handleIsRecurring}">
        <slot name="recurring">${this._i18n.t("I'd like to contribute regularly")}</slot>
      </vaadin-checkbox>
      <slot></slot>
      <vaadin-select
        name="recurring-value"
        ?hidden="${!this.isRecurring}"
        label="${this.label}"
        value="${this.options[0]}"
      >
        <template>
          <vaadin-list-box>
            ${this.options.map(
              o => html` <vaadin-item value="${o}">${this.friendlyFrequency[o]}</vaadin-item> `
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
