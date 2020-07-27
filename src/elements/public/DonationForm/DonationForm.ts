import { ChooseValue, ChooseDesignation, ChooseFrequency } from './private/index';
import { Translatable } from '../../../mixins/translatable';

import { DonationFormField } from './types';

import { html, property, query } from 'lit-element';

import '@vaadin/vaadin-form-layout/vaadin-form-layout';
import '@vaadin/vaadin-button/vaadin-button';
import '@vaadin/vaadin-checkbox/vaadin-checkbox';
import '@vaadin/vaadin-text-field/vaadin-text-area';

import '@vaadin/vaadin-checkbox/vaadin-checkbox-group';
import '@vaadin/vaadin-form-layout/vaadin-form-item';
import '@vaadin/vaadin-icons/vaadin-icons';
import '@vaadin/vaadin-item/vaadin-item-mixin';
import '@vaadin/vaadin-radio-button/vaadin-radio-button';
import '@vaadin/vaadin-radio-button/vaadin-radio-group';
import '@vaadin/vaadin-select/vaadin-select';

type CustomWindow = Window & { FC?: any };
/**
 * A configurable donation form.
 *
 * There is only one required property, which is the Store Subdomain, that allows the component to receive donations to your store at Foxy.io.
 *
 * - ChoseValue: Allow the user to choose the amount to donate;
 * - Recurrency: Allow the user to commit to a recurring donation;
 * - Designation: Allow the user to choose a particular designation for the donation;
 * - Anonymous: Allow the user to choose not to be recognized as the donnor.
 * - Comment: Allow the user to leave a comment;
 * - SubmitButton: Allow the user to submit the form
 *
 * @slot value - content to be displayed related to the choose value input field
 * @slot after-value - content to be displayed after the value widget
 * @slot recurrence - content to be displayed related to the recurrence input field
 * @slot after-recurrence - content to be displayed after the recurrence widget
 * @slot anonymous - content to be displayed related to the anonymous field
 * @slot after-anonymous - content to be displayed after the anonymous widget
 * @slot designation - content to be displayed related to the designation field
 * @slot after-designation - content to be displayed after the designation widget
 * @slot comment - content to be displayed related to the comment field
 * @slot after-comment - content to be displayed after the comment widget
 * @slot submit - content to be displayed related to the submit field
 */
export class DonationForm extends Translatable {
  public static get scopedElements() {
    return {
      'vaadin-form-layout': customElements.get('vaadin-form-layout'),
      'vaadin-button': customElements.get('vaadin-button'),
      'vaadin-checkbox': customElements.get('vaadin-checkbox'),
      'vaadin-text-area': customElements.get('vaadin-text-area'),
      'iron-icon': customElements.get('iron-icon'),
      'x-designation': ChooseDesignation,
      'x-value': ChooseValue,
      'x-frequency': ChooseFrequency,
    };
  }

  defaultSubdomain = 'jamstackecommerceexample.foxycart.com';
  currency = '';

  @property({ type: String })
  storeSubdomain = this.defaultSubdomain;

  @property({ type: String })
  name = 'FOXYDONATIONFORM';

  @property({ type: String })
  code = '';

  @property({ type: String })
  image = '';

  @property({ type: String })
  url = '';

  @query('input[name=name]')
  fieldName?: HTMLInputElement;

  @query('input[name=price]')
  fieldPrice?: HTMLInputElement;

  @query('input[name=designation]')
  fieldDesignation?: HTMLInputElement;

  @query('input[name=quantity]')
  fieldQuantity?: HTMLInputElement;

  @query('input[name=sub_frequency]')
  fieldSubFrequency?: HTMLInputElement;

  @query('input[name=anonymous]')
  fieldAnonymous?: HTMLInputElement;

  @query('input[name=comment]')
  fieldComment?: HTMLInputElement;

  @property({ type: String })
  value = '100';

  @property({ type: Number })
  valueWeight = 1;

  @property({ type: String })
  valueType = 'radio';

  @property({ type: Array })
  valueOptions: string[] = [];

  @property({ type: String })
  valueLabel = 'Select the value';

  @property({ type: Boolean })
  askValueOther = false;

  @property({ type: Boolean })
  askDesignationOther = false;

  // Recurrence
  @property({ type: Boolean })
  askRecurrence = false;

  @property({ type: Number })
  recurrenceWeight = 2;

  @property({ type: String })
  recurrenceLabel = this._t('donation.defaultRecurrenceLabel');

  @property({ type: String })
  designationType = 'checkbox';

  @property({ type: Number })
  designationWeight = 5;

  @property({ type: String })
  designationLabel = this._t('donation.defaultDesignationLabel');

  @property({ type: Array })
  designationOptions = [];

  // Anonymous
  @property({ type: Boolean })
  askAnonymous = false;

  @property({ type: Number })
  anonymousWeight = 4;

  // Comment
  @property({ type: Boolean })
  askComment = false;

  @property({ type: Number })
  commentWeight = 3;

  @property({ type: String })
  commentLabel = this._t('donation.defaultCommentLabel');

  @property({ type: String })
  commentPlaceholder = this._t('donation.defaultCommentPlaceholder');

  // Submit Button
  @property({ type: Boolean })
  submitButtonIcon = true;

  @property({ type: String })
  submitButtonText = this._t('donation.defaultSubmitButtonText');

  @query('form')
  form?: HTMLFormElement;

  constructor() {
    super('donation-form');
    this.loadFoxy();
  }

  /** Creates a script tag for loader.js if it not exists and sets a
   * ready.done callback */
  loadFoxy() {
    if (!('FC' in window)) {
      // Compute src
      let storeName = this.storeSubdomain;
      if (this.storeSubdomain.endsWith('.foxycart.com')) {
        storeName = this.storeSubdomain.replace('.foxycart.com', '');
      }
      const src = `https://cdn.foxycart.com/${storeName}/loader.js`;
      // Check if script is present
      const loader = document.querySelector(`script[src="${src}"]`);
      // Insert loader if not present
      if (!loader) {
        const script = document.createElement('script');
        if (!document.querySelector('foxy-loader-script')) {
          script.type = 'text/javascript';
          script.setAttribute('data-cfasync', 'false');
          script.async = true;
          script.defer = true;
          script.setAttribute('id', 'foxy-loader-script');
          let storeName = this.storeSubdomain;
          if (this.storeSubdomain.endsWith('.foxycart.com')) {
            storeName = this.storeSubdomain.replace('.foxycart.com', '');
          }
          script.src = `https://cdn.foxycart.com/${storeName}/loader.js`;
          document.head.appendChild(script);
        }
      }
      const W = window as CustomWindow;
      W.FC = W.FC || {};
      // Create FC onload
      const originalCallback = W.FC.onLoad;
      W.FC.onLoad = () => {
        if (originalCallback != undefined) {
          originalCallback();
        }
        W.FC.client.on('ready.done', () => {
          this.updateFromFC();
        });
      };
    }
  }

  /** Update the form with values from FC */
  updateFromFC() {
    const FC = (window as CustomWindow).FC;
    this.currency = FC.json.locale_info.currency_symbol;
  }

  /** LitElement life cicle */
  firstUpdated() {
    if (!this.valueOptions.length) {
      this.fieldPrice!.setAttribute('value', this.value);
    } else {
      this.fieldPrice!.setAttribute('value', this.valueOptions[0]);
    }
    this.value = this.fieldPrice!.value;
    if (this.defaultSubdomain == this.storeSubdomain) {
      console.error(this._t('donation.errorNoStoreSubdomain'));
    }
  }

  handleFrequency = {
    handleEvent: (e: { target: { value: string } }) => {
      if (e.target.value) {
        this.fieldSubFrequency!.value = e.target.value;
      }
    },
  };

  handleDonationValue = {
    handleEvent: (e: { target: { value: string } }) => {
      if (e.target.value) {
        this.fieldPrice!.value = e.target.value;
        this.value = this.fieldPrice!.value;
      }
    },
  };

  handleDonationDesignation = {
    handleEvent: (e: { target: { value: string } }) => {
      this.fieldDesignation!.value = JSON.stringify(e.target.value);
    },
  };

  handleAnonymous = {
    handleEvent: (e: { target: { checked: boolean } }) => {
      if (this.fieldAnonymous) {
        this.fieldAnonymous.value = e.target!.checked ? 'true' : 'false';
      }
    },
  };

  handleComment = {
    handleEvent: (e: { target: { value: string } }) => {
      if (this.fieldComment) {
        this.fieldComment.value = e.target!.value;
      }
    },
  };

  handleSubmit = {
    form: this.form,
    handleEvent: (e: Event) => {
      const fd: any = new FormData(this.form);
      this.form!.submit();
    },
  };

  weightSort(a: DonationFormField, b: DonationFormField) {
    if (+a.weight() < +b.weight()) {
      return -1;
    }
    if (+a.weight() > +b.weight()) {
      return 1;
    }
    return 0;
  }

  get fields(): DonationFormField[] {
    return [
      {
        name: 'valueTemplate',
        weight: () => this.valueWeight,
        condition: () => !!this.valueOptions.length,
        template: html`
          <x-value
            @change=${this.handleDonationValue}
            label="${this.valueLabel}"
            .valueOptions=${this.valueOptions}
            inputType="${this.valueType}"
            ?askValueOther=${this.askValueOther}
          >
            <slot name="value"></slot>
          </x-value>
          <slot name="after-value"></slot>
        `,
      },
      {
        name: 'recurrenceTemplate',
        weight: () => this.recurrenceWeight,
        condition: () => this.askRecurrence,
        template: html`
          <x-frequency @change=${this.handleFrequency} label="${this._t(this.recurrenceLabel)}">
            <slot name="recurrence"></slot>
          </x-frequency>
          <slot name="after-recurrence"></slot>
        `,
      },
      {
        name: 'commentTemplate',
        weight: () => this.commentWeight,
        condition: () => this.askComment,
        template: html`
          <slot name="comment"></slot>
          <vaadin-text-area
            @change=${this.handleComment}
            label="${this.commentLabel}"
            placeholder="${this._t(this.commentPlaceholder)}"
          ></vaadin-text-area>
          <slot name="after-comment"></slot>
        `,
      },
      {
        name: 'anonymousTemplate',
        weight: () => this.anonymousWeight,
        condition: () => this.askAnonymous,
        template: html`
          <vaadin-checkbox @change=${this.handleAnonymous}>
            <slot name="anonymous">${this._t('donation.defaultRemainAnonymous')}</slot>
          </vaadin-checkbox>
          <slot name="after-anonymous"></slot>
        `,
      },
      {
        name: 'designationTemplate',
        weight: () => this.designationWeight,
        condition: () => !!this.designationOptions.length,
        template: html`
          <x-designation
            @change=${this.handleDonationDesignation}
            label="${this.designationLabel}"
            ?askValueOther=${this.askDesignationOther}
            inputType="${this.designationType}"
            .designationOptions=${this.designationOptions}
          >
            <slot name="designation"></slot>
          </x-designation>
          <slot name="after-designation"></slot>
        `,
      },
    ];
  }

  render() {
    return html`
      <form method="POST" action="https://${this.storeSubdomain}/cart">
        <slot></slot>
        <vaadin-form-layout>
          ${this.fields
            .sort(this.weightSort)
            .filter(f => f.condition())
            .map(f => html`${f.template}`)}
        </vaadin-form-layout>

        <input type="hidden" name="name" value="${this.name}" />
        <input type="hidden" name="code" value="${this.code}" />
        <input type="hidden" name="image" value="${this.image}" />
        <input type="hidden" name="url" value="${this.url}" />
        <input type="hidden" name="price" value="${this.value}" />
        <input type="hidden" name="quantity" value="1" />
        <input type="hidden" name="anonymous" value="" />
        <input type="hidden" name="designation" value="" />
        <input type="hidden" name="comment" value="" />
        <input type="hidden" name="sub_frequency" value="" />

        <vaadin-button type="submit" role="submit" @click=${this.handleSubmit}
          >${this.submitButtonIcon
            ? html`<iron-icon icon="vaadin:user-heart" slot="prefix"></iron-icon>`
            : ''}
          <slot name="submit">
            <slot name="submit-text">${this._t(this.submitButtonText)}</slot>
            <slot name="submit-value">${this.currency}${this.value}</slot>
          </slot>
        </vaadin-button>
      </form>
    `;
  }
}
