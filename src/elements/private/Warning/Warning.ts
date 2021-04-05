import { CSSResult, CSSResultArray, LitElement, TemplateResult, html } from 'lit-element';

import { Themeable } from '../../../mixins/themeable';

export class Warning extends LitElement {
  public static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  public render(): TemplateResult {
    return html`
      <p
        class="flex text-s border border-contrast-10 rounded-t-l rounded-b-l p-s text-body leading-s"
      >
        <iron-icon icon="lumo:error" class="text-error flex-shrink-0 mr-s"></iron-icon>
        <slot></slot>
      </p>
    `;
  }
}
