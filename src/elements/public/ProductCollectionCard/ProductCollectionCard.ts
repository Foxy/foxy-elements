import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { getResourceId } from '@foxy.io/sdk/core';
import { html } from 'lit-html';

const NS = 'product-collection-card';
const Base = ConfigurableMixin(TranslatableMixin(TwoLineCard, NS));

const INK = 'var(--lumo-contrast-20pct)';
const diagonal = (angle: number) =>
  `repeating-linear-gradient(${angle}deg, ${INK} 0 5px, transparent 5px 14px)`;
const zig = (angle: number, x: number) =>
  `linear-gradient(${angle}deg, ${INK} 25%, transparent 25%) ${x}px 0 / 18px 18px`;

/** Decorative backgrounds, one per collection by its id. Plain CSS gradients: nothing to download. */
export const PATTERNS = [
  diagonal(45),
  diagonal(-45),
  `repeating-linear-gradient(90deg, ${INK} 0 6px, transparent 6px 18px)`,
  `repeating-linear-gradient(0deg, ${INK} 0 3px, transparent 3px 11px)`,
  `radial-gradient(${INK} 2.5px, transparent 3px) 0 0 / 14px 14px`,
  `radial-gradient(${INK} 4px, transparent 4.5px) 0 0 / 22px 22px, radial-gradient(${INK} 4px, transparent 4.5px) 11px 11px / 22px 22px`,
  `${zig(135, -9)}, ${zig(225, -9)}, ${zig(315, 0)}, ${zig(45, 0)}`,
  `conic-gradient(${INK} 25%, transparent 0 50%, ${INK} 0 75%, transparent 0) 0 0 / 18px 18px`,
  `linear-gradient(${INK} 1.5px, transparent 1.5px) 0 0 / 14px 14px, linear-gradient(90deg, ${INK} 1.5px, transparent 1.5px) 0 0 / 14px 14px`,
  `repeating-linear-gradient(45deg, ${INK} 0 1.5px, transparent 1.5px 10px), repeating-linear-gradient(-45deg, ${INK} 0 1.5px, transparent 1.5px 10px)`,
  `linear-gradient(45deg, ${INK} 50%, transparent 50%) 0 0 / 16px 16px`,
  `radial-gradient(circle, transparent 4px, ${INK} 4px 5.5px, transparent 6px) 0 0 / 20px 20px`,
  `radial-gradient(circle at 50% 100%, transparent 6px, ${INK} 6px 8px, transparent 8.5px) 0 0 / 18px 11px`,
  `repeating-linear-gradient(60deg, ${INK} 0 2px, transparent 2px 12px), repeating-linear-gradient(-60deg, ${INK} 0 2px, transparent 2px 12px)`,
];

/**
 * Card element for a product collection (`fx:product_collection`): its name,
 * indented by how deep it sits in the tree, with its path below.
 *
 * @element foxy-product-collection-card
 * @since 1.54.0
 */
export class ProductCollectionCard extends Base<Data> {
  renderBody(): TemplateResult {
    const data = this.data;
    if (!data) return html``;

    const path = data.path || `/${data.slug}`;
    const depth = Math.max(0, path.split('/').filter(Boolean).length - 1);
    const fade = 'linear-gradient(to right, transparent, #000)';
    // The API gives a collection's id only in its link.
    const id = Number(getResourceId(data._links.self.href)) || 0;

    return html`
      <div class="relative text-body text-m font-lumo leading-xs">
        <div
          aria-hidden="true"
          data-testid="pattern"
          class="absolute"
          style="top: 0; right: 0; bottom: 0; width: 45%; background: ${PATTERNS[
            id % PATTERNS.length
          ]}; -webkit-mask-image: ${fade}; mask-image: ${fade}"
        ></div>
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
