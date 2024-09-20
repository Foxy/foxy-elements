import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { UserInvitationForm } from '../../UserInvitationForm';
import type { Data } from '../../types';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalUserInvitationFormSyncAction extends InternalControl {
  static get properties(): PropertyDeclarations {
    return { ...super.properties, status: {}, theme: {} };
  }

  status: Data['status'] | null = null;

  theme: string | null = null;

  renderControl(): TemplateResult {
    return html`
      <vaadin-button
        theme=${ifDefined(this.theme ?? void 0)}
        class="w-full"
        ?disabled=${this.disabled}
        @click=${() => {
          const nucleon = this.nucleon as UserInvitationForm | null;
          const status = this.status;
          if (status) nucleon?.edit({ status }), nucleon?.submit();
        }}
      >
        <foxy-i18n infer="" key="caption"></foxy-i18n>
      </vaadin-button>
    `;
  }
}
