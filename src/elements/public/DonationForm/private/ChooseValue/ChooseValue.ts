import { html, property, query } from 'lit-element';
import { Stateful } from '../../../../../mixins/stateful';
import { ChooseValueMachine, ChooseValueEvent, ChooseValueSchema } from './ChooseValueMachine';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-select/vaadin-select';
import '@vaadin/vaadin-list-box/vaadin-list-box';
import '@vaadin/vaadin-item/vaadin-item-mixin';
import '@vaadin/vaadin-radio-button/vaadin-radio-group';
import '@vaadin/vaadin-radio-button/vaadin-radio-button';

/**
 * An element to select a value for donation
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class ChooseValue extends Stateful<void, ChooseValueSchema, ChooseValueEvent> {
  public static get scopedElements() {
    return {
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'vaadin-select': customElements.get('vaadin-select'),
      'vaadin-list-box': customElements.get('vaadin-list-box'),
      'vaadin-item': customElements.get('vaadin-item'),
      'vaadin-radio-group': customElements.get('vaadin-radio-group'),
      'vaadin-radio-button': customElements.get('vaadin-radio-button'),
    };
  }
  valuePair: [number | string, number | string] = [0, 0];

  @property({ type: String })
  name = 'value';

  @property({ type: String })
  label = '';

  @property({ type: String })
  inputType: 'radio' | 'select' = 'radio';

  valueOptions = [10, 20, 30];

  @property({ type: Boolean })
  askValueOther = false;

  isValueOther = false;

  @property({ type: String })
  valueOther = 'Other';

  @property({ type: String })
  currency = '$';

  @property()
  value: number | string = 0;

  @query('input')
  input?: HTMLInputElement;

  constructor() {
    super(() => ChooseValueMachine, 'donation-form');

    this.service.onTransition(state => {
      if (state.value == 'other') {
        this.value = this.valuePair[1];
      } else if (state.value == 'selected') {
        this.value = this.valuePair[0];
      }
    });
  }

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('value')) {
      this.dispatchEvent(new Event('change'));
    }
  }

  render() {
    return html`
      <slot></slot>

      ${this.inputType === 'select' ? this.renderSelect() : this.renderRadio()}

      <vaadin-text-field
        ?hidden=${!this.service.state.matches('other')}
        type="number"
        label="${this._t('choosevalue.customvalue.label')}"
        name="other"
        placeholder="${this._t('choosevalue.customvalue.placeholder')}"
        @change=${this.handleValue}
      ></vaadin-text-field>
    `;
  }

  handleValue = {
    handleEvent: (e: Event) => {
      const t = e.target as HTMLSelectElement;
      if (t.getAttribute('name') === 'other') {
        this.valuePair[1] = t.value;
        this.service.send('OTHER');
      } else if (t.value === 'other') {
        this.service.send('OTHER');
      } else {
        this.valuePair[0] = t.value;
        this.service.send('SELECT');
      }
    },
  };

  renderSelect() {
    return html`
      <vaadin-select
        name="value-options"
        @change=${this.handleValue}
        label="${this.label}"
        value="${this.valueOptions[0]}"
      >
        <template>
          <vaadin-list-box>
            ${this.valueOptions.map(
              o => html`<vaadin-item value="${o}">${this.currency} ${o}</vaadin-item>`
            )}
            ${this.askValueOther
              ? html`<vaadin-item class="other-option" value="other"
                  >${this.valueOther}</vaadin-item
                >`
              : ''}
          </vaadin-list-box>
        </template>
      </vaadin-select>
    `;
  }
  renderRadio() {
    return html`
      <vaadin-radio-group
        name="value-options"
        @change=${this.handleValue}
        theme="vertical"
        value="${this.valueOptions[0]}"
      >
        <label>${this.label}</label>
        ${this.valueOptions.map(
          (o, index) =>
            html`<vaadin-radio-button value="${o}" ?checked=${index == 0 ? 1 : 0}>
              ${this.currency} ${o}
            </vaadin-radio-button>`
        )}
        ${this.askValueOther
          ? html`<vaadin-radio-button class="other-option" value="other">
              ${this.valueOther}
            </vaadin-radio-button>`
          : ''}
      </vaadin-radio-group>
    `;
  }
}
