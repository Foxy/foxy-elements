import { Themeable } from '../../../../mixins/themeable';
import { html, css, CSSResultArray, TemplateResult, internalProperty, property } from 'lit-element';

export class Picture extends Themeable {
  static get styles() {
    return [
      super.styles,
      css`
        .product.image {
          height: 100px;
          width: 100px;
        }
        .back {
          height: 100px;
          width: 100px;
          position: absolute;
          transform: rotate(0);
          transition: 0.3s transform;
          z-index: -1;
          opacity: 0.4;
        }
        .multiple .back {
          transform: rotate(-10deg);
        }
        .front {
        }
      `,
    ];
  }

  @property({ type: String })
  public src?: string;

  @property({ type: String })
  public alt?: string;

  @property({ type: Number })
  public quantity?: number;

  public render(): TemplateResult {
    return html`
      <div class="product image m-m ${this.quantity && this.quantity > 1 ? 'multiple' : ''}">
        <img
          class="back object-cover w-full h-full rounded-s shadow-xl"
          src="${this.src}"
          alt="${this.alt}"
        />
        <img
          class="front object-cover w-full h-full rounded-s shadow-xl"
          src="${this.src}"
          alt="${this.alt}"
        />
      </div>
    `;
  }
}
