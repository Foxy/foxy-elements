import { html, property, query } from 'lit-element';
import { Stateful } from '../../../../../mixins/stateful';
import { ChooseValueMachine, ChooseValueEvent, ChooseValueSchema } from './ChooseValueMachine';

/**
 * An element to select a value for donation
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class ChooseValue extends Stateful<void, ChooseValueSchema, ChooseValueEvent> {
  valuePair: [number | string, number | string] = [0, 0];

  @property({ type: String })
  name = 'value';

  @property({ type: String })
  label = '';

  @property({ type: String })
  inputType = 'radio';

  valueOptions = [10, 20, 30];

  @property({ type: Boolean })
  hasValueOther = false;

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
    super(() => ChooseValueMachine, 'choose-value');

    this.service.onTransition(state => {
      if (state.value == 'other') {
        this.value = this.valuePair[1];
      } else if (state.value == 'selected') {
        this.value = this.valuePair[0];
      } else {
        this.value = '';
      }
    });
  }

  updated() {
    this.dispatchEvent(new Event('change'));
  }

  render() {
    return html`
      <slot></slot>

      ${this.inputType === 'select' ? this.renderSelect() : this.renderRadio()}

      <vaadin-text-field
        ?hidden=${!this.service.state.matches('other')}
        type="number"
        label="Other:"
        name="other"
        placeholder="Enter a custom amount."
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
      } else if (t.value === this.valueOther) {
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
        @change=${this.handleValue}
        label="${this.label}"
        value="${this.valueOptions[0]}"
      >
        <template>
          <vaadin-list-box>
            ${this.valueOptions.map(
              o => html`<vaadin-item value="${o}">${this.currency} ${o}</vaadin-item>`
            )}
            ${this.hasValueOther
              ? html`<vaadin-item value="${this.valueOther}">${this.valueOther}</vaadin-item>`
              : ''}
          </vaadin-list-box>
        </template>
      </vaadin-select>
    `;
  }
  renderRadio() {
    return html`
      <vaadin-radio-group
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
        ${this.hasValueOther
          ? html`<vaadin-radio-button value="${this.valueOther}">
              ${this.valueOther}
            </vaadin-radio-button>`
          : ''}
      </vaadin-radio-group>
    `;
  }
}
