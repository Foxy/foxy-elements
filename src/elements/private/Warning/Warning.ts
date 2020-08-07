import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { html, TemplateResult } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';

export class Warning extends Themeable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  public render(): TemplateResult {
    return html`
      <p class="flex text-s bg-primary-10 rounded p-m text-primary leading-s">
        <iron-icon icon="lumo:error" class="flex-shrink-0 mr-m"></iron-icon>
        <slot></slot>
      </p>
    `;
  }
}
