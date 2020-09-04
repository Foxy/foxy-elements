import { Themeable } from '../../../../mixins/themeable';
import { html, css, CSSResultArray, TemplateResult, internalProperty, property } from 'lit-element';

export class Picture extends Themeable {
  static get styles() {
    return [
      super.styles,
      css`
        .back {
          transform: rotate(0);
          transition: 0.3s transform;
          opacity: 0.4;
        }
        .multiple .back {
          transform: rotate(-10deg);
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

  @property({ type: Number })
  public width?: number;

  @property({ type: Number })
  public height?: number;

  public render(): TemplateResult {
    return html`
      <div
        class="product w-full h-full image ${this.quantity && this.quantity > 1 ? 'multiple' : ''}"
      >
        <img
          style="${this.__imageSize()}"
          class="back object-cover w-full h-full rounded-s shadow-xl absolute"
          src="${this.src}"
          alt="${this.alt}"
        />
        <img
          style="${this.__imageSize()}"
          width="${this.width}"
          height="${this.height}"
          class="front object-cover w-full h-full rounded-s shadow-xl relative"
          src="${this.src}"
          alt="${this.alt}"
        />
      </div>
    `;
  }

  private __imageSize() {
    return `${this.width ? 'width:' + this.width + 'px;' : ''} ${
      this.height ? 'height:' + this.height + 'px;' : ''
    }`;
  }
}
