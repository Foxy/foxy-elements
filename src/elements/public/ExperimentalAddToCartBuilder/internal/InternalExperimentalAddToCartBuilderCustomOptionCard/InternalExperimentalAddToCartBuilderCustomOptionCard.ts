import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { InternalCard } from '../../../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

export class InternalExperimentalAddToCartBuilderCustomOptionCard extends InternalCard<Data> {
  renderBody(): TemplateResult {
    return html`
      <div class="flex justify-between items-center h-xs">
        <span class="font-medium">${this.data?.name}</span>
        <span class="text-secondary">${this.data?.value}</span>
      </div>
    `;
  }
}
