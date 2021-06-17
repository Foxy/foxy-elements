import { CSSResult, CSSResultArray, LitElement, PropertyDeclarations, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Themeable } from '../../../mixins/themeable';

export class PropertyTable extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      disabled: { reflect: true, type: Boolean },
      items: { attribute: false },
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
      css`
        .max-w-0 {
          max-width: 0;
        }
      `,
    ];
  }

  items: { name: string; value: string }[] = [];

  disabled = false;

  render(): TemplateResult {
    const tdValueColor = this.disabled ? 'text-disabled' : 'text-body';
    const tdNameColor = this.disabled ? 'text-disabled' : 'text-secondary';
    const tdClass = 'max-w-0 truncate py-s';

    return html`
      <table class="font-lumo text-m leading-m w-full">
        <tbody class="divide-y divide-contrast-10">
          ${this.items.map(
            ({ name, value }) => html`
              <tr>
                <td class="${tdClass} ${tdNameColor} w-1-3 pr-m" title=${name}>${name}</td>
                <td class="${tdClass} ${tdValueColor} w-2-3" title=${value}>${value}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}
