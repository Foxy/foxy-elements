import '@vaadin/vaadin-combo-box';
import '@vaadin/vaadin-text-field/vaadin-integer-field';
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
import { CustomFieldElement, CustomFieldI18n } from '@vaadin/vaadin-custom-field';

import { FrequencyInputChangeEvent } from './FrequencyInputChangeEvent';
import { live } from '@open-wc/lit-helpers';
import memoize from 'lodash-es/memoize';
import { parseDuration } from '../../../utils/parse-duration';

export class FrequencyInput extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      checkValidity: { attribute: false },
      errorMessage: { attribute: 'error-message', type: String },
      disabled: { reflect: true, type: Boolean },
      readonly: { reflect: true, type: Boolean },
      label: { type: String },
      value: { type: String },
      lang: { type: String },
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
      { label: this.__t('day', { count }), value: 'd' },
      { label: this.__t('week', { count }), value: 'w' },
      { label: this.__t('month', { count }), value: 'm' },
      { label: this.__t('year', { count }), value: 'y' },
    ];
  });

  private __untrackTranslations?: () => void;

  connectedCallback(): void {
    super.connectedCallback();
    this.__untrackTranslations = customElements.get('foxy-i18n').onTranslationChange(() => {
      this.__getItems.cache.clear?.();
      this.requestUpdate();
    });
  }

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

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.__untrackTranslations?.();
  }

  checkValidity(): boolean {
    return true;
  }

  private get __t() {
    return customElements.get('foxy-i18n').i18next.getFixedT(this.lang);
  }

  private __handleChange(evt: CustomEvent<void>) {
    const field = evt.target as CustomFieldElement;
    this.value = field.value as string;
    this.dispatchEvent(new FrequencyInputChangeEvent(this.value));
  }
}
