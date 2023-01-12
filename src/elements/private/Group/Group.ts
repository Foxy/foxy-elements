import {
  CSSResult,
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  html,
} from 'lit-element';

import { Themeable } from '../../../mixins/themeable';

export class Group extends LitElement {
  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      frame: { type: Boolean },
    };
  }

  public static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  public frame = false;

  public render(): TemplateResult {
    const frameClass = 'border border-contrast-10 overflow-hidden';

    return html`
      <section class="space-y-s font-lumo antialiased">
        <h3 class=${`text-s font-medium text-secondary leading-none ${this.frame ? '' : 'pl-m'}`}>
          <slot name="header"></slot>
        </h3>

        <div class="rounded ${this.frame ? frameClass : ''}">
          <slot></slot>
        </div>
      </section>
    `;
  }
}
