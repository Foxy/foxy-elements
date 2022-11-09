import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'template-set-card';
const Base = TranslatableMixin(InternalCard, NS);

export class TemplateSetCard extends Base<Data> {
  renderBody(): TemplateResult {
    const { description = '', code = '' } = this.data ?? {};

    return html`
      <div class="flex justify-between gap-s">
        <span class="font-semibold truncate flex-shrink-0">${description}&ZeroWidthSpace;</span>
        <span class="truncate text-tertiary">${code}&ZeroWidthSpace;</span>
      </div>
    `;
  }
}
