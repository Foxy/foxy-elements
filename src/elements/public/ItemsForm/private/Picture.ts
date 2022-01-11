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
  public static readonly placeholder =
    'data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"%3E%3Crect width="40" height="40" fill="%23E8E8E8"/%3E%3Cpath d="M31.5143 0H24.5476L0 24.5476V31.5143L11.7046 19.8097L11.9841 17.0782C12.0983 15.9624 13.0131 15.1154 14.1038 15.1154H15.7373V12.1923C15.7373 10.9815 16.6915 10 17.8687 10H21.5143L31.5143 0Z" fill="white"/%3E%3Cpath d="M11.5434 21.3852L0 32.9285V39.8953L11.5822 28.3131C11.172 27.8663 10.9438 27.2444 11.012 26.5782L11.5434 21.3852Z" fill="white"/%3E%3Cpath d="M12.4305 28.879L1.30951 40H8.27631L19.2763 29H13.1316C12.8853 29 12.6495 28.9573 12.4305 28.879Z" fill="white"/%3E%3Cpath d="M28.3113 19.965L28.0159 17.0782C27.9116 16.0591 27.1395 15.2642 26.1754 15.1341L40 1.3095V8.27627L28.3113 19.965Z" fill="white"/%3E%3Cpath d="M20.6905 29L9.69049 40H16.6572L27.9755 28.6817C27.6541 28.8832 27.2756 29 26.8684 29H20.6905Z" fill="white"/%3E%3Cpath d="M28.6572 28C28.9128 27.5952 29.0415 27.1003 28.988 26.5782L28.4426 21.2479L40 9.69053V16.6572L28.6572 28Z" fill="white"/%3E%3Cpath d="M25.0381 40H18.0715L40 18.0715V25.0381L25.0381 40Z" fill="white"/%3E%3Cpath d="M26.4524 40H33.4191L40 33.4191V26.4524L26.4524 40Z" fill="white"/%3E%3Cpath d="M40 40H34.8333L40 34.8333V40Z" fill="white"/%3E%3Cpath d="M16.1666 0H23.1334L0 23.1334V16.1666L16.1666 0Z" fill="white"/%3E%3Cpath d="M14.7524 0H7.78571L0 7.78573V14.7524L14.7524 0Z" fill="white"/%3E%3Cpath d="M0 0H6.37152L0 6.37151V0Z" fill="white"/%3E%3Cpath d="M21.467 11.4615H17.8687C17.4763 11.4615 17.1582 11.7887 17.1582 12.1923V15.1154H22.8418V12.1923C22.8418 11.7887 22.5237 11.4615 22.1313 11.4615H21.467Z" fill="white"/%3E%3Cpath d="M24.7798 15.1154H24.2627V12.1923C24.2627 11.227 23.6562 10.4075 22.8138 10.1148L32.9286 0H39.89L24.7798 15.1154Z" fill="white"/%3E%3C/svg%3E';

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      quantity: { attribute: false },
      image: { attribute: false },
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
    image.addEventListener('error', () => (image.src = Picture.placeholder));

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
