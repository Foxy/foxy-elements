import { Themeable } from '../../../../mixins/themeable';
import { html, css, CSSResultArray, TemplateResult, PropertyDeclarations } from 'lit-element';

export class Picture extends Themeable {
  static get styles(): CSSResultArray {
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

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      alt: { type: String },
      height: { type: Number },
      quantity: { type: Number },
      src: { type: String },
      width: { type: Number },
    };
  }

  public src?: string;

  public alt?: string;

  public quantity?: number;

  public width?: number;

  public height?: number;

  public render(): TemplateResult {
    return html`
      <div
        class="product w-full h-full image ${this.quantity && this.quantity > 1 ? 'multiple' : ''}"
      >
        <img
          style="${this.__imageSize()}"
          class="back object-cover w-full h-full rounded-s shadow-m absolute"
          src="${this.src}"
          alt="${this.alt}"
        />
        <img
          style="${this.__imageSize()}"
          width="${this.width}"
          height="${this.height}"
          class="front object-cover w-full h-full rounded-s shadow-m relative"
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
