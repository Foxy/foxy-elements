import '@polymer/polymer/lib/elements/custom-style.js';
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

/**
 * A configurable donation form.
 *
 * It offers a consisten interface with sensible default values for most of the
 * fields.
 *
 * There is only one required property, which is the Store Subdomain, that
 * allows the component to receive donations to your store at Foxy.io.
 *
 * Each field can be shown or hidder by setting the
 * "askField" property, where "Field" one of the following:
 * - ChoseValue: Allow the user to choose the amount to donate;
 * - Recurrency: Allow the user to commit to a recurring donation;
 * - Designation: Allow the user to choose a particular designation for the
 * donation;
 * - Anonymous: Allow the user to choose not to be recognized as the donnor.
 * - Comment: Allow the user to leave a comment;
 * - SubmitButton: Allow the user to submit the form
 *
 *
 * @slot value - content to be displayed related to the choose value input field
 * @slot recurrence - content to be displayed related to the recurrence input field
 * @slot anonymous - content to be displayed related to the anonymous field
 * @slot designation - content to be displayed related to the designation field
 * @slot comment - content to be displayed related to the comment field
 * @slot submit - content to be displayed related to the submit field
 *
 * @slot - This element has a slot
 * @csspart button - The button
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

  vocabulary = {
    defaultRecurrenceLabel: this._i18n.t('Could you commit to a recurring donation?'),
    defaultDesignationLabel: this._i18n.t('Choose a designation'),
    defaultCommentLabel: this._i18n.t('Please, leave a comment.'),
    defaultCommentPlaceholder: this._i18n.t(
      "We'd like to hear from you. Please, leave us a comment."
    ),
    defaultSubmitButtonText: this._i18n.t('Donate now'),
    errorNoStoreSubdomain: this._i18n.t(`You haven't set your Store Subdomain.
        Please, be sure to provide your Store Subdomain as in 
        '<foxy-donation storeSubdomain="MYSTORESUBDOMAIN"></foxy-donation>'`),
    defaultRemainAnonymous: this._i18n.t("I'd like to remain anonymous"),
  };

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

  // Config
  @property({ type: String })
  currency = '$';

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
  recurrenceLabel = this.vocabulary.defaultRecurrenceLabel;

  @property({ type: String })
  designationType = 'checkbox';

  @property({ type: Number })
  designationWeight = 5;

  @property({ type: String })
  designationLabel = this.vocabulary.defaultDesignationLabel;

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
  commentLabel = this.vocabulary.defaultCommentLabel;

  @property({ type: String })
  commentPlaceholder = this.vocabulary.defaultCommentPlaceholder;

  // Submit Button
  @property({ type: Boolean })
  submitButtonIcon = true;

  @property({ type: String })
  submitButtonText = this.vocabulary.defaultSubmitButtonText;

  @query('form')
  form?: HTMLFormElement;

  constructor() {
    super();
    setTimeout(() => {
      if (this.defaultSubdomain == this.storeSubdomain) {
        console.error(this.vocabulary.errorNoStoreSubdomain);
      }
    }, 500);
    if (this.valueOptions.length) {
      if (!this.value || !this.valueOptions.includes(this.value)) {
        this.value = this.valueOptions[0];
      }
    }
  }

  firstUpdated() {
    if (!this.valueOptions.length) {
      this.fieldPrice!.setAttribute('value', this.value);
    } else {
      this.fieldPrice!.setAttribute('value', this.valueOptions[0]);
    }
    this.value = this.fieldPrice!.value;
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
        template: html` <x-value
          @change=${this.handleDonationValue}
          label="${this.valueLabel}"
          .valueOptions=${this.valueOptions}
          inputType="${this.valueType}"
          ?askValueOther=${this.askValueOther}
        >
          <slot name="value"></slot>
        </x-value>`,
      },
      {
        name: 'recurrenceTemplate',
        weight: () => this.recurrenceWeight,
        condition: () => this.askRecurrence,
        template: html` <x-frequency
          @change=${this.handleFrequency}
          label="${this.recurrenceLabel}"
        >
          <slot name="recurrence"></slot>
        </x-frequency>`,
      },
      {
        name: 'commentTemplate',
        weight: () => this.commentWeight,
        condition: () => this.askComment,
        template: html` <slot name="comment"></slot>
          <vaadin-text-area
            @change=${this.handleComment}
            label="${this.commentLabel}"
            placeholder="${this.commentPlaceholder}"
          ></vaadin-text-area>`,
      },
      {
        name: 'anonymousTemplate',
        weight: () => this.anonymousWeight,
        condition: () => this.askAnonymous,
        template: html` <vaadin-checkbox @change=${this.handleAnonymous}>
          <slot name="anonymous">${this.vocabulary.defaultRemainAnonymous}</slot>
        </vaadin-checkbox>`,
      },
      {
        name: 'designationTemplate',
        weight: () => this.designationWeight,
        condition: () => !!this.designationOptions.length,
        template: html` <x-designation
          @change=${this.handleDonationDesignation}
          label="${this.designationLabel}"
          ?askValueOther=${this.askDesignationOther}
          inputType="${this.designationType}"
          .designationOptions=${this.designationOptions}
        >
          <slot name="designation"></slot>
        </x-designation>`,
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
            .map(
              (f, i) => html`
                <slot name="before-${i}"></slot>
                ${f.template}
                <slot name="after-${i}"></slot>
              `
            )}
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

        <slot name="before-button"></slot>
        <vaadin-button type="submit" role="submit" @click=${this.handleSubmit}
          >${this.submitButtonIcon
            ? html`<iron-icon icon="vaadin:user-heart" slot="prefix"></iron-icon>`
            : ''}
          <slot name="submit">
            <slot name="submit-text">${this.submitButtonText}</slot>
            <slot name="submit-value">${this.currency}${this.value}</slot>
          </slot>
        </vaadin-button>
      </form>
    `;
  }
}
