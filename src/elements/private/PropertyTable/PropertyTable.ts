import { CSSResult, CSSResultArray, LitElement, PropertyDeclarations, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { Themeable } from '../../../mixins/themeable';

export class PropertyTableElement extends LitElement {
  static get properties(): PropertyDeclarations {
    return {
      items: { attribute: false },
      lang: { type: String },
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

  render(): TemplateResult {
    const tdClass = 'max-w-0 truncate py-s';

    return html`
      <table class="font-lumo text-body text-m leading-m w-full">
        <thead class="sr-only">
          <tr>
            <th><foxy-i18n lang=${this.lang} key="property"></foxy-i18n></th>
            <th><foxy-i18n lang=${this.lang} key="value"></foxy-i18n></th>
          </tr>
        </thead>

        <tbody class="divide-y divide-contrast-10">
          ${this.items.map(
            ({ name, value }) => html`
              <tr>
                <td class="${tdClass} w-1/3 pr-m text-tertiary" title=${name}>${name}</td>
                <td class="${tdClass} w-2/3" title=${value}>${value}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}
