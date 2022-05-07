import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-custom-field';
import '@vaadin/vaadin-combo-box';
import '../../public/I18n/index';

import {
  CSSResult,
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';
import type { CustomFieldElement, CustomFieldI18n } from '@vaadin/vaadin-custom-field';

import { FrequencyInputChangeEvent } from './FrequencyInputChangeEvent';
import { TranslatableMixin } from '../../../mixins/translatable';
import { live } from '@open-wc/lit-helpers';
import memoize from 'lodash-es/memoize';
import { parseDuration } from '../../../utils/parse-duration';
import { InferrableMixin } from '../../../mixins/inferrable';

export class FrequencyInput extends TranslatableMixin(InferrableMixin(LitElement)) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      checkValidity: { attribute: false },
      errorMessage: { type: String, attribute: 'error-message' },
      disabled: { type: Boolean, reflect: true },
      readonly: { type: Boolean, reflect: true },
      label: { type: String },
      value: { type: String },
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return css`
      :host {
        display: block;
      }

      vaadin-custom-field {
        width: 100%;
        font-size: 0;
        line-height: 0;
        padding-top: 0 !important;
      }

      vaadin-custom-field::part(label) {
        padding-bottom: var(--lumo-space-s);
      }

      vaadin-custom-field::part(error-message)[aria-hidden='false'] {
        padding-top: var(--lumo-space-xs);
      }

      vaadin-integer-field,
      vaadin-combo-box {
        width: calc(50% - (var(--lumo-space-s) / 2));
      }

      vaadin-integer-field {
        margin-right: var(--lumo-space-s);
        padding: 0;
      }

      vaadin-combo-box::part(text-field) {
        padding: 0;
      }
    `;
  }

  label = '';

  value = '';

  disabled = false;

  readonly = false;

  errorMessage = '';

  private __i18n: CustomFieldI18n = {
    formatValue: inputValues => inputValues.join(''),
    parseValue: value => {
      const { count, units } = parseDuration(value);
      return [count.toString(), units];
    },
  };

  private __getItems = memoize((value: string) => {
    const count = parseDuration(value).count;

    return [
      { value: 'd', label: this.t('day', { count }) },
      { value: 'w', label: this.t('week', { count }) },
      { value: 'm', label: this.t('month', { count }) },
      { value: 'y', label: this.t('year', { count }) },
    ];
  });

  render(): TemplateResult {
    return html`
      <vaadin-custom-field
        data-testid="field"
        .i18n=${this.__i18n}
        .label=${this.label}
        .value=${live(this.value)}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .errorMessage=${this.errorMessage}
        .checkValidity=${this.checkValidity}
        @change=${this.__handleChange}
      >
        <vaadin-integer-field
          data-testid="value"
          min="1"
          max="999"
          has-controls
          prevent-invalid-input
          ?invalid=${!this.checkValidity()}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
        >
        </vaadin-integer-field>

        <vaadin-combo-box
          data-testid="units"
          item-value-path="value"
          item-label-path="label"
          .items=${this.__getItems(this.value)}
          ?invalid=${!this.checkValidity()}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
        >
        </vaadin-combo-box>
      </vaadin-custom-field>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    const field = this.renderRoot.firstElementChild as CustomFieldElement;
    if (field.value !== this.value) field.value = this.value;
  }

  checkValidity(): boolean {
    return true;
  }

  private __handleChange(evt: CustomEvent<void>) {
    const field = evt.target as CustomFieldElement;
    this.value = field.value as string;
    this.dispatchEvent(new FrequencyInputChangeEvent(this.value));
  }
}
