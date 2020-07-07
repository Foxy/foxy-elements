import { html } from 'lit-element';
import { Themeable } from '../../mixins/themeable';

export class Warning extends Themeable {
  public static get scopedElements() {
    return {
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  public render() {
    return html`
      <p class="flex text-s bg-primary-10 rounded p-m text-primary leading-s">
        <iron-icon icon="lumo:error" class="flex-shrink-0 mr-m"></iron-icon>
        <slot></slot>
      </p>
    `;
  }
}
