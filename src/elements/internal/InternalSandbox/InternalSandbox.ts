import { LitElement, PropertyDeclarations } from 'lit-element';

export class InternalSandbox extends LitElement {
  static get properties(): PropertyDeclarations {
    return { render: { attribute: false } };
  }
}
