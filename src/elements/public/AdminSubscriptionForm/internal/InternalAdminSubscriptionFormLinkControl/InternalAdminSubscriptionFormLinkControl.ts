import type { AdminSubscriptionForm } from '../../AdminSubscriptionForm';
import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { ResponsiveMixin } from '../../../../../mixins/responsive';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { html } from 'lit-html';

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

      if (this.search) {
        const originalParams = new URLSearchParams(url.search);
        url.search = this.search;
        originalParams.forEach((value, key) => url.searchParams.set(key, value));
      }

      href = url.toString();
    } catch {
      href = undefined;
    }

    return html`
      <div class="leading-xs flex items-center gap-xs">
        <foxy-i18n class="truncate min-w-0" infer="" key="label"></foxy-i18n>
        <span class="text-tertiary"> &bull; </span>
        <foxy-copy-to-clipboard
          layout="complete"
          theme="tertiary-inline"
          infer="copy-to-clipboard"
          text=${href}
        >
        </foxy-copy-to-clipboard>
      </div>

      <foxy-i18n class="leading-xs block text-xs text-secondary" infer="" key="helper_text">
      </foxy-i18n>
    `;
  }
}
