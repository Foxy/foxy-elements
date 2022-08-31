import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

export class ItemCategoryCard extends InternalCard<Data> {
  renderBody(): TemplateResult {
    const data = this.data;

    return html`
      <div class="flex justify-between gap-s">
        <div class="font-semibold truncate flex-shrink-0">${data?.name}&ZeroWidthSpace;</div>
        ${data?.name !== data?.code
          ? html`<div class="truncate text-tertiary">${data?.code}</div>`
          : ''}
      </div>
    `;
  }
}
