import { Translatable } from '../../../../mixins/translatable';
import { html, css, CSSResultArray, TemplateResult, property, internalProperty } from 'lit-element';
import { ImageDescription } from '../types';
import { Picture } from './index';

export class PictureGrid extends Translatable {
  public static get scopedElements(): Record<string, unknown> {
    return {
      'x-picture': Picture,
    };
  }

  private static __baseWidth = 88;
  private static __baseGap = 4;

  static get styles(): CSSResultArray {
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

  @internalProperty()
  private __images: ImageDescription[] = [];

  @internalProperty()
  private __missingImages: TemplateResult[] = [];

  @property({ type: Array })
  public set images(value: ImageDescription[]) {
    this.__images = value.filter(i => {
      return i.src && i.src !== 'null' && i.src !== 'undefined';
    });
    this.__missingImages = [];
    for (let i = 0; i < 4 - this.__images.length; i++) {
      this.__missingImages.push(this.__renderShadow());
    }
  }

  public get images(): ImageDescription[] {
    return this.__images;
  }

  @internalProperty()
  private __eachWidth = PictureGrid.__baseWidth;
  @internalProperty()
  private __eachHeight = PictureGrid.__baseWidth;

  public render(): TemplateResult {
    if (!this.__images || !this.__images.length) {
      return html`${this._t('no_images')}`;
    }
    return html` <div
      class="image-grid flex flex-wrap max-w-xs min-w-1 block w-full sm:w-auto ${this.__images
        .length > 1
        ? 'multiple'
        : ''}"
    >
      ${this.__images.length == 1
        ? this.__renderPicture(this.__images[0], 0)
        : this.__images.map(this.__renderPicture.bind(this)).concat(this.__missingImages)}
    </div>`;
  }

  constructor() {
    super();
    this.__setWidth();
  }

  public updated(): void {
    this.__setWidth();
  }

  private __setWidth(): void {
    if (this.__images.length > 1) {
      this.__eachHeight = PictureGrid.__baseWidth / 2;
      this.__eachWidth = PictureGrid.__baseWidth / 2;
    } else {
      this.__eachHeight = PictureGrid.__baseWidth;
      this.__eachWidth = PictureGrid.__baseWidth;
    }
  }

  private __renderShadow() {
    return html`<div class="block w-full h-full rounded-s relative bg-shade-20"></div>`;
  }

  private __renderPicture(description: ImageDescription, index: number): TemplateResult {
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
