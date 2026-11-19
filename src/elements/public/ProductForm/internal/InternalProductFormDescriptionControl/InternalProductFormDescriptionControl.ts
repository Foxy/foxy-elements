import type { TextAreaElement } from '@vaadin/vaadin-text-field/vaadin-text-area';
import type { CSSResultArray, TemplateResult } from 'lit-element';

import { InternalTextAreaControl } from '../../../../internal/InternalTextAreaControl/InternalTextAreaControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { labelStyles } from '../styles';
import { html } from 'lit-element';

/**
 * The product description, in Markdown. Unlike the shared text area, Enter
 * starts a new line rather than submitting the form.
 *
 * @element foxy-internal-product-form-description-control
 */
export class InternalProductFormDescriptionControl extends InternalTextAreaControl {
  static get styles(): CSSResultArray {
    return [...super.styles, labelStyles];
  }

  renderControl(): TemplateResult {
    return html`
      <vaadin-text-area
        error-message=${ifDefined(this._errorMessage)}
        helper-text=${this.helperText}
        placeholder=${this.placeholder}
        label=${this.label}
        class="w-full"
        style="min-height: 8rem"
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .value=${this._value}
        @input=${(evt: CustomEvent) => {
          this._value = (evt.currentTarget as TextAreaElement).value;
        }}
      >
      </vaadin-text-area>
    `;
  }
}
