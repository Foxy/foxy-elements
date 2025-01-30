import type { AdminSubscriptionForm } from '../../AdminSubscriptionForm';
import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { ResponsiveMixin } from '../../../../../mixins/responsive';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { html, svg } from 'lit-html';

export class InternalAdminSubscriptionFormLinkControl extends ResponsiveMixin(InternalControl) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      search: {},
    };
  }

  search: string | null = null;

  renderControl(): TemplateResult {
    const form = this.nucleon as AdminSubscriptionForm | null;
    let href: string | undefined;

    try {
      const url = new URL(form?.data?._links['fx:sub_token_url'].href ?? '');
      if (this.search) url.search = this.search;
      href = url.toString();
    } catch {
      href = undefined;
    }

    return html`
      <div class="leading-s sm-flex sm-items-center sm-gap-m">
        <foxy-i18n
          class="block whitespace-nowrap text-s text-secondary sm-text-m sm-text-body sm-flex-1 sm-flex-shrink-0"
          infer=""
          key="label"
        >
        </foxy-i18n>

        <div class="flex items-center gap-xs min-w-0">
          <a
            target="_blank"
            class="min-w-0 flex-1 truncate font-medium rounded cursor-pointer hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50"
            href=${href}
          >
            ${href}
          </a>

          <foxy-copy-to-clipboard
            infer="copy-to-clipboard"
            class="text-s flex-shrink-0"
            text=${href}
          >
          </foxy-copy-to-clipboard>

          <div
            class="transition-colors text-tertiary flex-shrink-0 cursor-pointer hover-text-body"
            id="trigger"
          >
            ${svg`<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: calc(1em * var(--lumo-line-height-xs)); height: calc(1em * var(--lumo-line-height-xs)); margin-right: -0.12em"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>`}
          </div>

          <vcf-tooltip
            position="bottom"
            theme="light"
            style="--lumo-base-color: black; max-width: 30rem"
            class="mt-s"
            for="trigger"
          >
            <foxy-i18n class="text-s" style="color: white" infer="" key="helper_text"></foxy-i18n>
          </vcf-tooltip>
        </div>
      </div>
    `;
  }
}
