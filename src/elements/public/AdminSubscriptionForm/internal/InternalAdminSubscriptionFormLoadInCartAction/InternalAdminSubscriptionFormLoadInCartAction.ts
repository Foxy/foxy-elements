import type { AdminSubscriptionForm } from '../../AdminSubscriptionForm';
import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalAdminSubscriptionFormLoadInCartAction extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      action: {},
    };
  }

  action: 'cancel' | null = null;

  renderControl(): TemplateResult {
    const form = this.nucleon as AdminSubscriptionForm | null;
    let href: string | undefined;

    try {
      const url = new URL(form?.data?._links['fx:sub_token_url'].href ?? '');
      if (this.action === 'cancel') url.searchParams.set('sub_cancel', 'true');
      href = url.toString();
    } catch {
      href = undefined;
    }

    return html`
      <a
        target="_blank"
        class="rounded font-medium text-primary group focus-outline-none focus-ring-2 focus-ring-primary-50"
        href=${ifDefined(href)}
      >
        <foxy-i18n class="transition-opacity group-hover-opacity-80" infer="" key="caption">
        </foxy-i18n>
      </a>
    `;
  }
}
