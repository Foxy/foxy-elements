import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'integration-card';
const Base = TranslatableMixin(InternalCard, NS);

export class IntegrationCard extends Base<Data> {
  renderBody(): TemplateResult {
    const data = this.data;
    const expires = new Date((data?.expires ?? 0) * 1000);
    const isActive = expires > new Date();
    const description = data?.project_description?.trim() || this.t('no_description');

    return html`
      <dl class="flex flex-wrap gap-xs leading-s">
        <div class="min-w-full">
          <div class="flex justify-between gap-s">
            <dt class="sr-only">${this.t('title_description')}</dt>
            <dd class="font-semibold truncate min-w-0">${data?.project_name}&ZeroWidthSpace;</dd>

            <dt class="sr-only">${this.t('status_description')}</dt>
            <dd class="whitespace-nowrap font-tnum">
              <foxy-i18n
                class=${isActive ? 'text-tertiary' : 'text-error'}
                infer=""
                key="status_${isActive ? 'active' : 'expired'}"
                .options=${{ date: expires, month: 'short', day: '2-digit' }}
              >
              </foxy-i18n>
            </dd>
          </div>

          <dt class="sr-only">${this.t('subtitle_description')}</dt>
          <dd class="text-secondary">${description}&ZeroWidthSpace;</dd>
        </div>

        <div class="text-secondary text-xs bg-contrast-5 rounded overflow-hidden flex">
          <dt class="font-semibold px-xs bg-contrast-5" lang="en">ID</dt>
          <dd class="px-xs"><code>${data?.client_id}</code>&ZeroWidthSpace;</dd>
        </div>

        <div class="text-secondary text-xs bg-contrast-5 rounded overflow-hidden flex">
          <dt class="font-semibold px-xs bg-contrast-5" lang="en">Scope</dt>
          <dd class="px-xs"><code>${data?.scope}</code>&ZeroWidthSpace;</dd>
        </div>
      </dl>
    `;
  }
}
