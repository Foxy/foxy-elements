import type { TemplateResult } from 'lit-html';
import type { CustomerForm } from '../../CustomerForm';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalCustomerFormLegalNoticeControl extends InternalControl {
  renderControl(): TemplateResult {
    const host = this.nucleon as CustomerForm | null;
    return html`
      <p class="leading-s text-xs text-secondary">
        <foxy-i18n infer="" key="text"></foxy-i18n>
        <a
          class="font-medium text-body rounded hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50"
          target="_blank"
          href=${ifDefined(host?.settings?.tos_checkbox_settings?.url)}
          rel="noopener noreferrer"
        >
          <foxy-i18n infer="" key="link"></foxy-i18n>
        </a>
      </p>
    `;
  }
}
