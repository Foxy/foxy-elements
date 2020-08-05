import { html, property, query } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import '@vaadin/vaadin-list-box/vaadin-list-box';
import '@vaadin/vaadin-item/vaadin-item-mixin';
import '@vaadin/vaadin-checkbox/vaadin-checkbox';
import '@vaadin/vaadin-checkbox/vaadin-checkbox-group';
import '@vaadin/vaadin-text-field/vaadin-text-field';

/**
 * An element to select a value for donation
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class ChooseDesignation extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-list-box': customElements.get('vaadin-list-box'),
      'vaadin-item': customElements.get('vaadin-item'),
      'vaadin-checkbox': customElements.get('vaadin-checkbox'),
      'vaadin-checkbox-group': customElements.get('vaadin-checkbox-group'),
      'vaadin-text-field': customElements.get('vaadin-text-field'),
    };
  }

  constructor() {
    super('donation-form');
  }

  @property({ type: String })
  public name = 'value';

  @property({ type: String })
  public label = '';

  @property({ type: String })
  public inputType = 'checkbox';

  public designationOptions: string[] = [];

  // Is the "Other field active"?
  private _activeOther = false;

  // Should there be a "Other" field?
  @property({ type: Boolean })
  public askValueOther = false;

  @property({ type: Array })
  public value: string[] = [];

  @query('#select-designations')
  public selectDesignations: any;

  @query('vaadin-text-field')
  public input?: HTMLInputElement;

  public updated() {
    this.dispatchEvent(new Event('change'));
  }

  public firstUpdated() {
    if (this.selectDesignations) {
      this.selectDesignations.addEventListener(
        'selected-values-changed',
        this._handleValue.handleEvent
      );
    }
  }

  private _handleValue = {
    handleEvent: () => {
      if (this.selectDesignations.value as string | Array<string>) {
        if (typeof this.selectDesignations.value == 'string') {
          this.value = [this.selectDesignations.value];
        } else {
          // Verify that "other" field is checked
          this._activeOther = this.selectDesignations.value.includes('other');
          // Rebuilds this.value with the value
          this.value = [].concat(this.selectDesignations.value.filter((i: string) => i != 'other'));
          // Includes the value from "other"
          if (this._activeOther) {
            this.value.push(this.input!.value);
          }
        }
      } else if (this.selectDesignations.selectedValues) {
        this._activeOther = !!this.selectDesignations.selectedValues.find(
          (i: number) => i == this.designationOptions.length
        );
        this.value = this.selectDesignations.selectedValues.map(
          (i: number) => this.designationOptions[i] || this.input?.value
        );
      }
    },
  };

  public render() {
    return html`
      <slot></slot>

      ${this.designationOptions.length
        ? this.inputType == 'select'
          ? this._renderSelect()
          : this._renderRadio()
        : this._renderText()}

      <vaadin-text-field
        ?hidden=${!this._activeOther}
        type="text"
        label=${this._t('choosedesignation.other')}
        name="other"
        placeholder=${this._t('choosedesignation.custom')}
        @change=${this._handleValue}
      ></vaadin-text-field>
    `;
  }

  private _renderSelect() {
    return html`
      <vaadin-list-box id="select-designations" multiple>
        <label>${this.label}</label>
        ${this.designationOptions.map(o => html`<vaadin-item value="${o}">${o}</vaadin-item>`)}
        ${this.askValueOther
          ? html`<vaadin-item value="other">${this._t('choosedesignation.other')}</vaadin-item>`
          : ''}
      </vaadin-list-box>
    `;
  }

  private _renderRadio() {
    return html`
      <vaadin-checkbox-group
        id="select-designations"
        @change=${this._handleValue}
        theme="vertical"
        label="${this.label}"
      >
        ${this.designationOptions.map(
          (o, index) =>
            html`<vaadin-checkbox value="${o}" ?checked=${index == 0 ? 1 : 0}>
              ${o}
            </vaadin-checkbox>`
        )}
        ${this.askValueOther
          ? html`<vaadin-checkbox value="other"
              >${this._t('choosedesignation.other')}</vaadin-checkbox
            >`
          : ''}
      </vaadin-checkbox-group>
    `;
  }

  private _renderText() {
    return html`
      <vaadin-text-field
        id="select-designations"
        type="text"
        label="${this.label}"
        @change=${this._handleValue}
      >
      </vaadin-text-field>
    `;
  }
}
