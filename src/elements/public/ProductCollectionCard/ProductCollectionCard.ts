import type { CSSResultArray } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { collectionDepth } from '../ProductList/listing';
import { getResourceId } from '@foxy.io/sdk/core';
import { css } from 'lit-element';
import { html } from 'lit-html';

const NS = 'product-collection-card';
const Base = ConfigurableMixin(TranslatableMixin(TwoLineCard, NS));

/** A hue per level of the tree: pink at the top, then orange, yellow, green, blue and purple. */
const HUES = [345, 24, 48, 140, 212, 268];

// Every kind is drawn with strokes 12 pixels thick, about as far apart as they are wide.
const KINDS: ((ink: string) => string)[] = [
  ink => `repeating-linear-gradient(0deg, ${ink} 0 12px, transparent 12px 24px)`,
  ink => `radial-gradient(circle, ${ink} 6px, transparent 6.5px) 0 0 / 24px 24px`,
  ink =>
    `radial-gradient(circle, transparent 6px, ${ink} 6.5px 18px, transparent 18.5px) 0 0 / 48px 48px`,
  ink =>
    `conic-gradient(${ink} 25%, transparent 0 50%, ${ink} 0 75%, transparent 0) 0 0 / 24px 24px`,
  ink =>
    [135, 225, 315, 45]
      .map(
        (angle, index) =>
          `linear-gradient(${angle}deg, ${ink} 25%, transparent 25%) ${
            index < 2 ? '-17px' : '0'
          } 0 / 34px 34px`
      )
      .join(', '),
  ink =>
    [0, 90]
      .map(angle => `linear-gradient(${angle}deg, ${ink} 12px, transparent 12px) 0 0 / 36px 36px`)
      .join(', '),
];

/**
 * A decorative background for a collection: stripes, dots, rings, checks,
 * zigzags or plaid, coloured by its depth and turned to any angle, both chosen
 * by its id so that a collection always gets the same one. Plain CSS
 * gradients: nothing to download.
 */
export function pattern(id: number, depth: number): { background: string; angle: number } {
  // Scrambled, so that neighbouring ids don't get neighbouring patterns.
  const hash = Math.imul(id ^ (id >>> 15), 0x85ebca6b) >>> 0;
  const ink = `hsla(${HUES[Math.min(depth, HUES.length - 1)]}, 55%, 55%, 0.2)`;
  return { background: KINDS[(hash >>> 12) % KINDS.length](ink), angle: hash % 180 };
}

/**
 * Card element for a product collection (`fx:product_collection`): its name,
 * indented by how deep it sits in the tree, with its path below.
 *
 * @element foxy-product-collection-card
 * @since 1.62.0
 */
export class ProductCollectionCard extends Base<Data> {
  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        :host {
          position: relative;
        }
      `,
    ];
  }

  // Outside the card's body, so that the pattern reaches the edges of whatever
  // padding the list around the card gives it.
  render(): TemplateResult {
    const data = this.data;
    if (!data) return super.render();

    const depth = collectionDepth(data.path || `/${data.slug}`);
    const fade = 'linear-gradient(to right, transparent, #000)';
    // The API gives a collection's id only in its link.
    const id = Number(getResourceId(data._links.self.href)) || 0;
    const { background, angle } = pattern(id, depth);

    return html`
      <div
        aria-hidden="true"
        class="absolute overflow-hidden"
        style="top: 0; right: 0; bottom: 0; width: 45%; -webkit-mask-image: ${fade}; mask-image: ${fade}"
      >
        <div
          data-testid="pattern"
          class="absolute"
          style="top: 50%; left: 50%; width: 30rem; height: 30rem; margin: -15rem 0 0 -15rem; background: ${background}; transform: rotate(${angle}deg)"
        ></div>
      </div>
      ${super.render()}
    `;
  }

  renderBody(): TemplateResult {
    const data = this.data;
    if (!data) return html``;

    const path = data.path || `/${data.slug}`;
    const depth = collectionDepth(path);

    return html`
      <div class="relative text-body text-m font-lumo leading-xs">
        <div
          class="relative"
          data-testid="tree"
          data-depth=${depth}
          style="margin-left: ${depth * 1.25}rem"
        >
          <div class="font-medium truncate" data-testid="title">
            ${depth
              ? html`<span class="text-tertiary" aria-hidden="true">↳ </span>`
              : ''}${data.name}
          </div>
          <div class="text-secondary truncate text-s" data-testid="subtitle">${path}</div>
        </div>
      </div>
    `;
  }
}
