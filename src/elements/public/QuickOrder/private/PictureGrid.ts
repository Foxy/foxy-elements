import { Themeable } from '../../../../mixins/themeable';
import { html, css, CSSResultArray, TemplateResult, internalProperty, property } from 'lit-element';
import { ImageDescription } from '../types';
import { Picture } from './index';

export class PictureGrid extends Themeable {
  public static get scopedElements(): Record<string, unknown> {
    return {
      'x-picture': Picture,
    };
  }

  private static __baseWidth = 88;
  private static __baseGap = 4;

  static get styles() {
    return [
      super.styles,
      css`
        .multiple {
          display: grid;
          grid: 'first second' ${PictureGrid.__baseWidth / 2}px 'third fourth' ${PictureGrid.__baseWidth /
            2}px / ${PictureGrid.__baseWidth / 2}px ${PictureGrid.__baseWidth / 2}px;
          grid-column-gap: ${PictureGrid.__baseGap}px;
          grid-row-gap: ${PictureGrid.__baseGap}px;
        }
        .first {
          grid-area: first;
        }
        .second {
          grid-area: second;
        }
        .third {
          grid-area: third;
        }
        .fourth {
          grid-area: fourth;
        }
      `,
    ];
  }

  private __areas = ['first', 'second', 'third', 'fourth'];

  @property({ type: Array })
  images: ImageDescription[] = [];

  private __eachWidth = PictureGrid.__baseWidth;
  private __eachHeight = PictureGrid.__baseWidth;

  public render(): TemplateResult {
    if (!this.images || !this.images.length) {
      return html`No images`;
    }
    return html` <div
      class="image-grid flex flex-wrap max-w-xs min-w-1 block w-full sm:w-auto ${this.images
        .length > 1
        ? 'multiple'
        : ''}"
    >
      ${this.images.length == 1
        ? this.__renderPicture(this.images[0], 0)
        : this.images.map(this.__renderPicture.bind(this))}
    </div>`;
  }

  constructor() {
    super();
    this.__setWidth();
  }

  public updated() {
    this.__setWidth();
  }

  private __setWidth() {
    if (this.images.length > 1) {
      this.__eachHeight = PictureGrid.__baseWidth / 2;
      this.__eachWidth = PictureGrid.__baseWidth / 2;
    } else {
      this.__eachHeight = PictureGrid.__baseWidth;
      this.__eachWidth = PictureGrid.__baseWidth;
    }
  }

  private __renderPicture(description: ImageDescription, index: number): TemplateResult {
    const multiple = this.images.length > 1;
    return html` <x-picture
      width="${this.__eachWidth}"
      height="${this.__eachHeight}"
      class="${this.__areas[index]}"
      alt="${description.alt ?? ''}"
      src="${description.src}"
      quantity="${description.quantity}"
    ></x-picture>`;
  }
}
