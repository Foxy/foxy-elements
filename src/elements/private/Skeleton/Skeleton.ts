import {
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { Themeable } from '../../../mixins/themeable';

/** @deprecated – use internal controls instead */
export class Skeleton extends LitElement {
  public static get styles(): CSSResultArray {
    return [
      Themeable.styles,
      css`
        @keyframes blink {
          from {
            opacity: 0.5;
          }

          to {
            opacity: 1;
          }
        }

        .animated {
          animation: blink 0.5s infinite alternate;
        }

        :host {
          display: inline-block;
          min-width: 4rem;
        }
      `,
    ];
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      variant: { type: String },
    };
  }

  public variant: 'static' | 'error' | null = null;

  public render(): TemplateResult {
    const bg = this.variant === 'error' ? 'bg-error-10' : 'bg-contrast-10';
    const animated = this.variant === null ? 'animated' : '';

    return html`
      <div class="relative">
        <span class="opacity-0"><slot></slot></span>
        <div class="${bg} ${animated} rounded my-xs absolute inset-0"></div>
      </div>
    `;
  }
}
