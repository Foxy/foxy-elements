import { html, property } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';

export class Group extends Themeable {
  @property({ type: Boolean })
  public frame = false;

  public render() {
    return html`
      <section class="space-y-s">
        <h3 class=${`text-s font-lumo text-tertiary ${this.frame ? '' : 'pl-m'}`}>
          <slot name="header"></slot>
        </h3>

        <div class=${this.frame ? 'rounded-t-l rounded-b-l border border-shade-10' : ''}>
          <slot></slot>
        </div>
      </section>
    `;
  }
}
