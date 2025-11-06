import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { InternalConfirmDialog } from '../InternalConfirmDialog/InternalConfirmDialog';
import type { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import type { ButtonElement } from '@vaadin/vaadin-button';

import { InternalControl } from '../InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalPostActionControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      messageOptions: { type: Object, attribute: 'message-options' },
      theme: {},
      href: {},
    };
  }

  messageOptions: Record<string, string> = {};

  theme: string | null = null;

  href: string | null = null;

  renderControl(): TemplateResult {
    return html`
      <foxy-internal-post-action-control-dialog
        message-options=${JSON.stringify(this.messageOptions)}
        infer=""
        href=${ifDefined(this.href ?? void 0)}
        @hide=${(evt: DialogHideEvent) => {
          if (!evt.detail.cancelled) this.dispatchEvent(new CustomEvent('success'));
        }}
      >
      </foxy-internal-post-action-control-dialog>

      <vaadin-button
        theme=${ifDefined(this.theme ?? void 0)}
        class="w-full"
        ?disabled=${this.disabled || this.readonly}
        @click=${(evt: CustomEvent) => {
          const button = evt.currentTarget as ButtonElement;
          const dialog = this.renderRoot.querySelector<InternalConfirmDialog>(
            'foxy-internal-post-action-control-dialog'
          );

          dialog?.show(button);
        }}
      >
        <foxy-i18n infer="" key="button"></foxy-i18n>
      </vaadin-button>
    `;
  }
}
