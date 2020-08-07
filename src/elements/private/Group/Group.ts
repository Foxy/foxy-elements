import { html, property, TemplateResult } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';

export class Group extends Themeable {
  @property({ type: Boolean })
  public frame = false;

  public render(): TemplateResult {
    const frameClass = 'border border-contrast-10';

    return html`
      <section class="space-y-s">
        <h3 class=${`text-s font-lumo text-tertiary ${this.frame ? '' : 'pl-m'}`}>
          <slot name="header"></slot>
        </h3>

        <div class="rounded-t-l rounded-b-l ${this.frame ? frameClass : ''}">
          <slot></slot>
        </div>
      </section>
    `;
  }
}
