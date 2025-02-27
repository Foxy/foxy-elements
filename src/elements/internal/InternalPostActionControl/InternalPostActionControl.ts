import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { InternalConfirmDialog } from '../InternalConfirmDialog/InternalConfirmDialog';
import type { NotificationElement } from '@vaadin/vaadin-notification';
import type { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import type { ButtonElement } from '@vaadin/vaadin-button';

import { InternalControl } from '../InternalControl/InternalControl';
import { html, render } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { API } from '../../public/NucleonElement/API';

export class InternalPostActionControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      messageOptions: { type: Object, attribute: 'message-options' },
      theme: {},
      href: {},
      __buttonState: {},
    };
  }

  messageOptions: Record<string, string> = {};

  theme: string | null = null;

  href: string | null = null;

  private __buttonState: 'idle' | 'busy' = 'idle';

  private readonly __api = new API(this);

  renderControl(): TemplateResult {
    return html`
      <foxy-internal-confirm-dialog
        header="header"
        infer="confirm-dialog"
        id="confirm-dialog"
        .messageOptions=${this.messageOptions}
        @hide=${(evt: DialogHideEvent) => {
          if (!evt.detail.cancelled) this.__sendPost();
        }}
      >
      </foxy-internal-confirm-dialog>

      <vaadin-notification
        position="bottom-end"
        duration="3000"
        theme="success"
        id="success-notification"
        .renderer=${this.__getNotificationRenderer('success')}
      >
      </vaadin-notification>

      <vaadin-notification
        position="bottom-end"
        duration="3000"
        theme="error"
        id="error-notification"
        .renderer=${this.__getNotificationRenderer('error')}
      >
      </vaadin-notification>

      <vaadin-button
        theme=${ifDefined(this.theme ?? void 0)}
        ?disabled=${this.disabled || this.readonly || this.__buttonState !== 'idle'}
        @click=${(evt: CustomEvent) => {
          const button = evt.currentTarget as ButtonElement;
          const dialog = this.renderRoot.querySelector<InternalConfirmDialog>('#confirm-dialog');
          dialog?.show(button);
        }}
      >
        <foxy-i18n infer="button" key=${this.__buttonState}></foxy-i18n>
      </vaadin-button>
    `;
  }

  private async __sendPost() {
    if (this.href && this.__buttonState === 'idle') {
      this.__buttonState = 'busy';

      const response = await this.__api.fetch(this.href, { method: 'POST' });
      const result = response.ok ? 'success' : 'error';
      const selector = `#${result}-notification`;
      const notification = this.renderRoot.querySelector<NotificationElement>(selector);

      notification?.open();
      this.__buttonState = 'idle';
      this.dispatchEvent(new CustomEvent(result));
    }
  }

  private __getNotificationRenderer(state: 'success' | 'error') {
    return (root: HTMLElement) => {
      if (!root.firstElementChild) root.innerHTML = '<span></span>';

      const layout = html`
        <foxy-i18n
          style="color: var(--lumo-${state}-contrast-color)"
          lang=${this.lang}
          key=${state}
          ns="${this.ns} notification"
        >
        </foxy-i18n>
      `;

      render(layout, root.firstElementChild!);
    };
  }
}
