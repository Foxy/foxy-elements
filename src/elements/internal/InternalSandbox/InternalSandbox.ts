import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

export class InternalSandbox extends LitElement {
  static get properties(): PropertyDeclarations {
    return { render: { attribute: false } };
  }

  render: () => TemplateResult = () => html``;
}
