import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { Themeable } from '../../../mixins/themeable';
import { html } from 'lit-html';

/** @deprecated – use internal controls instead */
export class Metadata extends Themeable {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean, reflect: true },
      items: { attribute: false },
    };
  }

  /** @deprecated */
  disabled = false;

  items: { name: string; value: string }[] = [];

  render(): TemplateResult {
    return html`
      <p class="font-lumo text-xs leading-s text-secondary">
        ${this.items.map(({ name, value }, i) => {
          return html`${i === 0 ? '' : html`&bull;`}${name} ${value}`;
        })}
      </p>
    `;
  }
}
