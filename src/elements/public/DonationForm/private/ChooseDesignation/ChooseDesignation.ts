import { LitElement, html, customElement, property, query } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import '@vaadin/vaadin-list-box/vaadin-list-box';
import '@vaadin/vaadin-item/vaadin-item-mixin';
import '@vaadin/vaadin-item/vaadin-item';
import '@vaadin/vaadin-checkbox/vaadin-checkbox';
import '@vaadin/vaadin-checkbox/vaadin-checkbox-group';

/**
 * An element to select a value for donation
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class ChooseDesignation extends Translatable {
  vocabulary = {
    other: this._i18n.t('Other'),
    customDesignation: this._i18n.t('Enter a custom designation'),
  };

  @property({ type: String })
  name = 'value';

  @property({ type: String })
  label = '';

  @property({ type: String })
  inputType = 'checkbox';

  designationOptions: string[] = [];

  // Is the "Other field active"?
  activeOther = false;

  // Should there be a "Other" field?
  @property({ type: Boolean })
  askValueOther = false;

  @property({ type: Array })
  value: string[] = [];

  @query('#select-designations')
  selectDesignations: any;

  @query('vaadin-text-field')
  input?: HTMLInputElement;

  updated() {
    this.dispatchEvent(new Event('change'));
  }

  firstUpdated() {
    if (this.selectDesignations) {
      this.selectDesignations.addEventListener(
        'selected-values-changed',
        this.handleValue.handleEvent
      );
    }
  }

  handleValue = {
    handleEvent: () => {
      if (this.selectDesignations.value as string | Array<string>) {
        if (typeof this.selectDesignations.value == 'string') {
          this.value = [this.selectDesignations.value];
        } else {
          // Verify that "other" field is checked
          this.activeOther = this.selectDesignations.value.includes('other');
          // Rebuilds this.value with the value
          this.value = [].concat(this.selectDesignations.value.filter((i: string) => i != 'other'));
          // Includes the value from "other"
          if (this.activeOther) {
            this.value.push(this.input!.value);
          }
        }
      } else if (this.selectDesignations.selectedValues) {
        this.activeOther = !!this.selectDesignations.selectedValues.find(
          (i: number) => i == this.designationOptions.length
        );
        this.value = this.selectDesignations.selectedValues.map(
          (i: number) => this.designationOptions[i] || this.input?.value
        );
      }
    },
  };

  render() {
    return html`
      <slot></slot>

      ${this.designationOptions.length
        ? this.inputType == 'select'
          ? this.renderSelect()
          : this.renderRadio()
        : this.renderText()}

      <vaadin-text-field
        ?hidden=${!this.activeOther}
        type="text"
        label=${this.vocabulary.other}
        name="other"
        placeholder=${this.vocabulary.customDesignation}
        @change=${this.handleValue}
      ></vaadin-text-field>
    `;
  }

  renderSelect() {
    return html`
      <vaadin-list-box id="select-designations" @change=${this.handleValue} multiple>
        <label>${this.label}</label>
        ${this.designationOptions.map(o => html`<vaadin-item value="${o}">${o}</vaadin-item>`)}
        ${this.askValueOther
          ? html`<vaadin-item value="other">${this.vocabulary.other}</vaadin-item>`
          : ''}
      </vaadin-list-box>
    `;
  }

  renderRadio() {
    return html`
      <vaadin-checkbox-group id="select-designations" theme="vertical" label="${this.label}">
        ${this.designationOptions.map(
          (o, index) =>
            html`<vaadin-checkbox value="${o}" ?checked=${index == 0 ? 1 : 0}>
              ${o}
            </vaadin-checkbox>`
        )}
        ${this.askValueOther
          ? html`<vaadin-checkbox value="other">${this.vocabulary.other}</vaadin-checkbox>`
          : ''}
      </vaadin-checkbox-group>
    `;
  }

  renderText() {
    return html`
      <vaadin-text-field
        id="select-designations"
        type="text"
        label="${this.label}"
        @change=${this.handleValue}
      >
      </vaadin-text-field>
    `;
  }
}
