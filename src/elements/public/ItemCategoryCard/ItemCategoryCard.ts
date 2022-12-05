import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { ResponsiveMixin } from '../../../mixins/responsive';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

export class ItemCategoryCard extends ResponsiveMixin(InternalCard)<Data> {
  renderBody(): TemplateResult {
    const data = this.data;

    return html`
      <div class="leading-s sm-flex sm-justify-between sm-gap-s">
        <div class="font-semibold truncate flex-shrink-0">${data?.name}&ZeroWidthSpace;</div>
        ${data?.name !== data?.code
          ? html`<div class="truncate text-tertiary text-s sm-text-m">${data?.code}</div>`
          : ''}
      </div>
    `;
  }
}
