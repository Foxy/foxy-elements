import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

export class TemplateCard extends TranslatableMixin(InternalCard)<Data> {
  renderBody(): TemplateResult {
    const data = this.data;
    const type = data?.content_url
      ? 'type_custom_url'
      : data?.content
      ? 'type_custom_text'
      : 'type_default';

    return html`
      <div class="flex justify-between gap-s">
        <foxy-i18n class="font-semibold truncate flex-shrink-0" infer="" key="title"></foxy-i18n>
        <foxy-i18n class="truncate text-tertiary" infer="" key=${type}></foxy-i18n>
      </div>
    `;
  }
}
