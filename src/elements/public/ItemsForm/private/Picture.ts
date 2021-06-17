import {
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { PreviewItem } from './Preview';
import { Themeable } from '../../../../mixins/themeable';

enum ImageState {
  Excluded = 0,
  BeforeEnter = 1,
  Default = 2,
  Previous = 3,
  BeforeExit = 4,
}

export class Picture extends LitElement {
  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      image: { attribute: false },
      quantity: { attribute: false },
    };
  }

  public static get styles(): CSSResultArray {
    return [
      Themeable.styles,
      css`
        .ease-out-back {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .blur-1 {
          filter: blur(1px);
        }

        .blur-2 {
          filter: blur(2px);
        }

        .grayscale {
          filter: grayscale();
        }

        .rotate-12 {
          --tw-rotate: 12deg;
        }

        .-rotate-12 {
          --tw-rotate: -12deg;
        }

        .-rotate-24 {
          --tw-rotate: -24deg;
        }

        .translate-y-half {
          --tw-translate-y: 50%;
        }
      `,
    ];
  }

  public quantity = 0;

  public image = '';

  public set empty(newValue: boolean) {
    this.updateComplete.then(() => {
      if (newValue) {
        const [, ...bottomImages] = this.__stack;
        bottomImages.forEach(image => image.remove());
      } else if (this.quantity > 1 && this.__stack.length < 2) {
        this.__insertImage(ImageState.Previous, this.__stack[0]);
      }
    });
  }

  public set data({ quantity, image }: PreviewItem) {
    this.quantity = quantity;
    this.image = image;
  }

  public render(): TemplateResult {
    return html`<div id="image" class="w-full h-full relative"></div>`;
  }

  public firstUpdated(): void {
    const top = this.__insertImage(ImageState.Default);
    if (this.quantity > 1) this.__insertImage(ImageState.Previous, top);
  }

  public updated(changedProperties: Map<keyof Picture, unknown>): void {
    if (changedProperties.has('quantity')) {
      const oldValue = changedProperties.get('quantity') as number | undefined;
      if (oldValue !== undefined) this.quantity > oldValue ? this.__add() : this.__remove();
    }

    if (changedProperties.has('image')) {
      this.__stack.forEach(image => (image.src = this.image));
    }
  }

  private get __container() {
    return this.shadowRoot!.getElementById('image')!;
  }

  private get __stack() {
    const list = this.__container?.querySelectorAll(':not(.opacity-0)') ?? [];
    return [...list].reverse() as HTMLImageElement[];
  }

  private __add() {
    const [current, previous] = this.__stack;

    if (this.quantity > 1) {
      if (current) this.__setImageState(current, ImageState.Previous);

      if (previous) {
        this.__setImageState(previous, ImageState.BeforeExit);
        previous.ontransitionend = /* istanbul ignore next */ () => previous.remove();
      }

      this.__setImageState(this.__insertImage(ImageState.BeforeEnter), ImageState.Default);
    } else {
      if (current) this.__setImageState(current, ImageState.Default);
    }
  }

  private __remove() {
    const [current, previous] = this.__stack;
    let imageToRemove: HTMLImageElement;

    if (this.quantity > 0) {
      if (previous) this.__setImageState(previous, ImageState.Default);
      imageToRemove = current;
    } else {
      if (current) this.__setImageState(current, ImageState.Excluded);
      imageToRemove = previous;
    }

    if (imageToRemove) {
      this.__setImageState(imageToRemove, ImageState.BeforeEnter);
      imageToRemove.ontransitionend = /* istanbul ignore next */ () => imageToRemove!.remove();
    }

    if (this.quantity > 1) {
      const last = this.__insertImage(ImageState.BeforeExit, this.__container.firstElementChild);
      this.__setImageState(last, ImageState.Previous);
    }
  }

  private __insertImage(state: ImageState, refChild: Node | null = null) {
    const image = new Image();
    image.src = this.image;
    image.setAttribute('part', 'picture');
    this.__setImageState(image, state);
    this.__container.insertBefore(image, refChild);
    return image;
  }

  private __setImageState(image: HTMLImageElement, state: ImageState) {
    const shared =
      'absolute inset-0 w-full h-full object-cover rounded transform transition duration-700 ease-out-back';

    const states = [
      'grayscale',
      'shadow-m translate-y-half scale-110 rotate-12 opacity-0',
      'shadow-m',
      'blur-1 -rotate-12 opacity-25',
      'blur-2 -rotate-24 opacity-0',
    ];

    void image.offsetHeight; // reflow
    image.className = [shared, states[state]].join(' ');
  }
}
