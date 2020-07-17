import { css, html } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';

export class Skeleton extends Themeable {
  public static get styles() {
    return [
      super.styles,
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

  public render() {
    return html`
      <div class="relative">
        <span class="opacity-0"><slot></slot></span>
        <div class="bg-contrast-10 rounded my-xs absolute inset-0 animated"></div>
      </div>
    `;
  }
}
