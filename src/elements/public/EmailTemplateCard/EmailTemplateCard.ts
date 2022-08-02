import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'email-template-card';
const Base = TranslatableMixin(InternalCard, NS);

export class EmailTemplateCard extends Base<Data> {
  renderBody(): TemplateResult {
    // TODO remove the directive below once SDK has the types
    // @ts-expect-error definition for template_language is missing in SDK types
    const language = this.data?.template_language ?? 'nunjucks';
    const languageToExtension: Record<string, string> = { nunjucks: '.njk', handlebars: '.hbs' };
    const extension = languageToExtension[language] ?? `.${language}`;

    return html`
      <div class="flex gap-m leading-s items-center">
        <div
          class="w-l h-l rounded bg-contrast-5 flex gap-xs flex-col items-center justify-center text-secondary"
        >
          <iron-icon class="icon-inline text-m" icon="editor:insert-drive-file"></iron-icon>
          <span class="font-bold tracking-wide uppercase text-xxxs leading-none">
            ${extension}
          </span>
        </div>

        <div class="grid grid-cols-1">
          <span class="font-semibold">${this.data?.description}</span>
          <foxy-i18n infer="" class="text-secondary" key="subtitle" .options=${this.data ?? {}}>
          </foxy-i18n>
        </div>
      </div>
    `;
  }
}
