import '@polymer/iron-icon';
import '@polymer/iron-icons';

import {
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
  html,
} from 'lit-element';

import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Themeable } from '../../../../mixins/themeable';
import { spread } from '@open-wc/lit-helpers/src/spread';

export class PictureGrid<TData = unknown> extends ScopedElementsMixin(LitElement) {
  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      empty: { attribute: false },
      data: { attribute: false },
    };
  }

  public static get styles(): CSSResultArray {
    return [
      Themeable.styles,
      css`
        .w-preview {
          width: 5.5rem;
        }

        .h-preview {
          height: 5.5rem;
        }

        .ease-out-back {
          transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .grayscale {
          filter: grayscale();
        }

        /* 1 */

        .grid-2 > :nth-child(1),
        .grid-3 > :nth-child(1),
        .grid-4 > :nth-child(1),
        .grid-4-plus > :nth-child(1) {
          --transform-scale-x: calc(2.5 / 5.5);
          --transform-scale-y: var(--transform-scale-x);
        }

        /* 2 */

        .grid-1 > :nth-child(2) {
          opacity: 0;
          --transform-translate-x: 100%;
          --transform-translate-y: var(--transform-translate-x);
        }

        .grid-2 > :nth-child(2),
        .grid-3 > :nth-child(2),
        .grid-4 > :nth-child(2),
        .grid-4-plus > :nth-child(2) {
          --transform-scale-x: calc(2.5 / 5.5);
          --transform-scale-y: var(--transform-scale-x);
        }

        .grid-3 > :nth-child(2),
        .grid-4 > :nth-child(2),
        .grid-4-plus > :nth-child(2) {
          transform-origin: top right;
        }

        /* 3 */

        .grid-1 > :nth-child(3),
        .grid-2 > :nth-child(3),
        .grid-3 > :nth-child(3),
        .grid-4 > :nth-child(3),
        .grid-4-plus > :nth-child(3) {
          --transform-scale-x: calc(2.5 / 5.5);
          --transform-scale-y: var(--transform-scale-x);
        }

        .grid-1 > :nth-child(3),
        .grid-2 > :nth-child(3) {
          opacity: 0;
          --transform-translate-y: 100%;
        }

        .grid-3 > :nth-child(3) {
          transform-origin: bottom right;
        }

        .grid-4 > :nth-child(3),
        .grid-4-plus > :nth-child(3) {
          transform-origin: bottom left;
        }

        /* 4 */

        .grid-1 > :nth-child(4),
        .grid-2 > :nth-child(4),
        .grid-3 > :nth-child(4),
        .grid-4 > :nth-child(4),
        .grid-4-plus > :nth-child(4) {
          --transform-scale-x: calc(2.5 / 5.5);
          --transform-scale-y: var(--transform-scale-x);
        }

        .grid-1 > :nth-child(4),
        .grid-2 > :nth-child(4),
        .grid-3 > :nth-child(4) {
          opacity: 0;
          transform-origin: bottom left;
          --transform-translate-x: 100%;
        }

        .grid-1 > :nth-child(4) > :first-child,
        .grid-2 > :nth-child(4) > :first-child,
        .grid-3 > :nth-child(4) > :first-child,
        .grid-4 > :nth-child(4) > :first-child {
          transform: perspective(250px) rotateX(-90deg);
        }

        .grid-4-plus > :nth-child(4) > :first-child,
        .grid-4 > :nth-child(4) > :last-child {
          transition-delay: 0.15s;
          transition-timing-function: ease-out;
        }

        .grid-4-plus > :nth-child(4) > :last-child,
        .grid-4 > :nth-child(4) > :first-child {
          transition-timing-function: ease-in;
        }

        .grid-4-plus > :nth-child(4) > :last-child {
          transform: perspective(250px) rotateX(90deg);
        }

        /* 5 (placeholder) */

        .grid-1 > :nth-child(5),
        .grid-3 > :nth-child(5),
        .grid-4 > :nth-child(5),
        .grid-4-plus > :nth-child(5) {
          opacity: 0;
        }

        .grid-1 > :nth-child(5) {
          --transform-translate-x: 100%;
        }

        .grid-2 > :nth-child(5),
        .grid-3 > :nth-child(5),
        .grid-4 > :nth-child(5),
        .grid-4-plus > :nth-child(5) {
          --transform-scale-x: calc(2.5 / 5.5);
          --transform-scale-y: var(--transform-scale-x);
        }

        .grid-3 > :nth-child(5),
        .grid-4 > :nth-child(5),
        .grid-4-plus > :nth-child(5) {
          --transform-translate-y: -100%;
        }

        /* 6 (placeholder) */

        .grid-1 > :nth-child(6),
        .grid-4 > :nth-child(6),
        .grid-4-plus > :nth-child(6) {
          opacity: 0;
        }

        .grid-1 > :nth-child(6) {
          --transform-translate-y: 100%;
        }

        .grid-2 > :nth-child(6),
        .grid-3 > :nth-child(6),
        .grid-4 > :nth-child(6),
        .grid-4-plus > :nth-child(6) {
          --transform-scale-x: calc(2.5 / 5.5);
          --transform-scale-y: var(--transform-scale-x);
        }

        .grid-4 > :nth-child(6),
        .grid-4-plus > :nth-child(6) {
          --transform-translate-x: -100%;
        }
      `,
    ];
  }

  public empty = false;

  public data: TData[] = [];

  public render(): TemplateResult {
    const length = this.data.length;
    const placeholderStyle = 'rounded bg-contrast-10';
    const sharedStyle = 'transition-all duration-700 ease-out-back transform absolute inset-0';
    const emptyStyle = this.empty ? 'grayscale' : '';
    const gridStyle = length > 4 ? 'grid-4-plus' : `grid-${Math.max(1, length)}`;

    const itemProps = spread({
      exportparts: 'picture',
      class: 'w-full h-full',
      '.empty': this.empty,
    });

    const [first, second, third, fourth] = this.data;

    return html`
      <div class="${gridStyle} w-preview h-preview relative font-lumo">
        <div class="${sharedStyle} ${emptyStyle} origin-top-left">
          ${first ? html`<x-pic ...=${itemProps} .data=${first}></x-pic>` : ''}
        </div>

        <div class="${sharedStyle} ${emptyStyle} origin-bottom-right">
          ${second ? html`<x-pic ...=${itemProps} .data=${second}></x-pic>` : ''}
        </div>

        <div class="${sharedStyle} ${emptyStyle} origin-top-right">
          ${third ? html`<x-pic ...=${itemProps} .data=${third}></x-pic>` : ''}
        </div>

        <div class="${sharedStyle} ${emptyStyle} origin-bottom-right">
          <div class="${placeholderStyle} flex text-body transition duration-150 absolute inset-0">
            ${length > 102
              ? html`<iron-icon icon="icons:more-horiz" class="m-auto w-xl h-xl"></iron-icon>`
              : html`<div class="m-auto text-xxxl">+${length - 3}</div>`}
          </div>
          <div class="transition duration-150 absolute inset-0">
            ${fourth ? html`<x-pic ...=${itemProps} .data=${fourth}></x-pic>` : ''}
          </div>
        </div>

        <div class="${sharedStyle} ${placeholderStyle} origin-top-right"></div>
        <div class="${sharedStyle} ${placeholderStyle} origin-bottom-left"></div>
      </div>
    `;
  }
}
