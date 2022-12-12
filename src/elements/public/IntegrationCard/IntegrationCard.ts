import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const NS = 'integration-card';
const Base = TranslatableMixin(InternalCard, NS);

export class IntegrationCard extends Base<Data> {
  renderBody(): TemplateResult {
    const data = this.data;
    const expires = new Date((data?.expires ?? 0) * 1000);
    const isActive = expires > new Date();

    return html`
      <div class="flex flex-wrap gap-xs leading-s">
        <div class="min-w-full">
          <div class="flex justify-between gap-s">
            <span class="font-semibold truncate min-w-0">
              ${data?.project_name}&ZeroWidthSpace;
            </span>

            <foxy-i18n
              class=${classMap({
                'whitespace-nowrap font-tnum text-s': true,
                'text-tertiary': isActive,
                'text-error': !isActive,
              })}
              infer=""
              key="status_${isActive ? 'active' : 'expired'}"
              .options=${{ date: expires, month: 'short', day: '2-digit' }}
            >
            </foxy-i18n>
          </div>

          <div class="text-secondary text-s">
            ${data?.project_description
              ? data.project_description
              : html`<foxy-i18n infer="" key="no_description"></foxy-i18n>`}
          </div>
        </div>

        <div class="text-secondary text-xs bg-contrast-5 rounded overflow-hidden flex">
          <span class="font-semibold px-xs bg-contrast-5" lang="en">ID</span>
          <span class="px-xs"><code>${data?.client_id}</code>&ZeroWidthSpace;</span>
        </div>

        <div class="text-secondary text-xs bg-contrast-5 rounded overflow-hidden flex">
          <span class="font-semibold px-xs bg-contrast-5" lang="en">Email</span>
          <span class="px-xs"><code>${data?.added_by_email}</code>&ZeroWidthSpace;</span>
        </div>
      </div>
    `;
  }
}
