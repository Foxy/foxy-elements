import { CSSResultArray, LitElement, PropertyDeclarations, css } from 'lit-element';
import { TemplateResult, html } from 'lit-html';

import { ThemeableMixin } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';

export class DataList extends ThemeableMixin(LitElement) {
  static get properties(): PropertyDeclarations {
    return {
      data: { type: Array },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        dt,
        dd {
          display: inline-block;
          overflow: hidden;
          vertical-align: top;
          overflow-wrap: anywhere;
        }
        dt {
          min-width: calc(5 * var(--lumo-size-l));
          padding-right: 0.5em;
        }
        dd {
          max-width: calc(15 * var(--lumo-size-l));
          min-width: calc(10 * var(--lumo-size-l));
        }
      `,
    ];
  }

  data: [string, unknown][] = [];

  render(): TemplateResult {
    return html`
      <dl class="space-y-s">
        ${this.data.map(entry => {
          const value = String(entry[1]).trim();
          return html`
            <div>
              <dt class="text-secondary truncate">${entry[0]}</dt>
              <dd class=${classMap({ 'text-tertiary': !value })}>${value || '–'}</dd>
            </div>
          `;
        })}
      </dl>
    `;
  }
}
