import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'email-template-card';
const Base = TranslatableMixin(InternalCard, NS);

export class EmailTemplateCard extends Base<Data> {
  renderBody(): TemplateResult {
    const data = this.data;
    const type =
      data?.content_html_url && data.content_html_url
        ? 'type_custom_url'
        : data?.content_html && data.content_text
        ? 'type_custom_text'
        : data?.content_html ||
          data?.content_html_url ||
          data?.content_text ||
          data?.content_text_url
        ? 'type_mixed'
        : 'type_default';

    return html`
      <div class="flex justify-between gap-s">
        <foxy-i18n
          class="font-semibold truncate flex-shrink-0"
          infer=""
          key="title"
          .options=${this.data}
        >
        </foxy-i18n>

        <foxy-i18n class="truncate text-tertiary" infer="" key=${type}></foxy-i18n>
      </div>
    `;
  }
}
