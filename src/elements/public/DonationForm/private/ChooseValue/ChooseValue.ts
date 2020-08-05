import { html, property, query } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import '@vaadin/vaadin-text-field/vaadin-text-field';
import '@vaadin/vaadin-select/vaadin-select';
import '@vaadin/vaadin-list-box/vaadin-list-box';
import '@vaadin/vaadin-item/vaadin-item-mixin';
import '@vaadin/vaadin-radio-button/vaadin-radio-group';
import '@vaadin/vaadin-radio-button/vaadin-radio-button';
import { interpret } from 'xstate';
import { ChooseValueMachine } from './ChooseValueMachine';

/**
 * An element to select a value for donation
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class ChooseValue extends Translatable {
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
  private _valuePair: [number | string, number | string] = [0, 0];

  @property({ type: String })
  public name = 'value';

  @property({ type: String })
  public label = '';

  @property({ type: String })
  public inputType: 'radio' | 'select' = 'radio';

  public valueOptions = [10, 20, 30];

  @property({ type: Boolean })
  public askValueOther = false;

  @property({ type: String })
  public valueOther = 'Other';

  @property({ type: String })
  public currency = '$';

  @property()
  public value: number | string = 0;

  @query('input')
  public input?: HTMLInputElement;

  public service = interpret(ChooseValueMachine)
    .onChange(() => this.requestUpdate())
    .onTransition(() => this.requestUpdate())
    .start();

  constructor() {
    super('donation-form');

    this.service.onTransition(state => {
      if (state.value == 'other') {
        this.value = this._valuePair[1];
      } else if (state.value == 'selected') {
        this.value = this._valuePair[0];
      }
    });
  }

  public updated() {
    this.dispatchEvent(new Event('change'));
  }

  public render() {
    return html`
      <slot></slot>

      ${this.inputType === 'select' ? this._renderSelect() : this._renderRadio()}

      <vaadin-text-field
        ?hidden=${!this.service.state.matches('other')}
        type="number"
        label="${this._t('choosevalue.customvalue.label')}"
        name="other"
        placeholder="${this._t('choosevalue.customvalue.placeholder')}"
        @change=${this._handleValue}
      ></vaadin-text-field>
    `;
  }

  private _handleValue = {
    handleEvent: (e: Event) => {
      const t = e.target as HTMLSelectElement;
      if (t.getAttribute('name') === 'other') {
        this._valuePair[1] = t.value;
        this.service.send('OTHER');
      } else if (t.value === 'other') {
        this.service.send('OTHER');
      } else {
        this._valuePair[0] = t.value;
        this.service.send('SELECT');
      }
    },
  };

  private _renderSelect() {
    return html`
      <vaadin-select
        name="value-options"
        @change=${this._handleValue}
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

  private _renderRadio() {
    return html`
      <vaadin-radio-group
        name="value-options"
        @change=${this._handleValue}
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
