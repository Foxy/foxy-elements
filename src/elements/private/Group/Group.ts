import { html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';

export class Group extends Themeable {
  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      frame: { type: Boolean },
    };
  }

  public frame = false;

  public render(): TemplateResult {
    const frameClass = 'border border-contrast-10';

    return html`
      <section class="space-y-s font-lumo antialiased">
        <h3 class=${`text-s font-medium text-secondary leading-none ${this.frame ? '' : 'pl-m'}`}>
          <slot name="header"></slot>
        </h3>

        <div class="rounded-t-l rounded-b-l ${this.frame ? frameClass : ''}">
          <slot></slot>
        </div>
      </section>
    `;
  }
}
