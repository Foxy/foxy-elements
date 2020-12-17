import { CSSResultArray, PropertyDeclarations, TemplateResult, css, html } from 'lit-element';

import { Themeable } from '../../../mixins/themeable';

export class Skeleton extends Themeable {
  public static get styles(): CSSResultArray {
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

        :host([size='box']) {
          display: block;
          min-width: auto;
        }
      `,
    ];
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      variant: { type: String },
      size: { type: String },
    };
  }

  public variant: 'static' | 'error' | 'busy' = 'busy';

  public size: 'box' | 'line' = 'line';

  public render(): TemplateResult {
    const bg = this.variant === 'error' ? 'bg-error-10' : 'bg-contrast-10';
    const padded = this.size === 'line' ? 'my-xs' : '';
    const rounded = this.size === 'line' ? 'rounded' : 'rounded-t-l rounded-b-l';
    const animated = this.variant === 'busy' ? 'animated' : '';

    return html`
      <div class="relative h-full">
        <span class="opacity-0"><slot>&nbsp;</slot></span>
        <div class="${bg} ${animated} ${rounded} ${padded} absolute inset-0"></div>
      </div>
    `;
  }
}
