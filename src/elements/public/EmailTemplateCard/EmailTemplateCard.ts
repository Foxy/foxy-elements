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
      <div class="flex items-center justify-between">
        <div class="font-semibold">${this.data?.description}&ZeroWidthSpace;</div>
        <div class="rounded-t-l rounded-b-l px-s py-xs bg-contrast-5">
          <span class="uppercase text-xs font-bold tracking-wide">${extension}</span>
        </div>
      </div>
    `;
  }
}
