import type { AdminSubscriptionForm } from '../../AdminSubscriptionForm';
import type { TemplateResult } from 'lit-html';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { html, svg } from 'lit-html';

export class InternalAdminSubscriptionFormError extends InternalControl {
  renderControl(): TemplateResult {
    return html`
      <p
        class="flex items-start gap-ds p-ds rounded border border-error-50"
        style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px); gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
      >
        ${svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" class="flex-shrink-0 text-error" style="width: 1.25em"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"></path></svg>`}
        <span>${(this.nucleon as AdminSubscriptionForm | null)?.data?.error_message}</span>
      </p>
    `;
  }
}
