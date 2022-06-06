import { PropertyDeclarations, html, TemplateResult } from 'lit-element';
import { InternalConfirmDialog } from '../../../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { DialogHideEvent } from '../../../../private/Dialog/DialogHideEvent';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { ButtonElement } from '@vaadin/vaadin-button';

export class InternalTransactionPostActionControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      theme: { type: String },
      state: { type: String },
      href: { type: String },
      icon: { type: String },
    };
  }

  theme = '';

  state = 'idle';

  href = '';

  icon = '';

  renderControl(): TemplateResult {
    const state = this.state;
    const theme = state === 'fail' ? 'error' : state === 'idle' ? this.theme : '';

    return html`
      <foxy-internal-confirm-dialog
        header="header"
        infer="confirm"
        id="confirm"
        @hide=${(evt: DialogHideEvent) => !evt.detail.cancelled && this.submit()}
      >
      </foxy-internal-confirm-dialog>

      <vaadin-button
        class="w-full"
        theme="${theme} tertiary"
        ?disabled=${state === 'busy' || this.disabled}
        @click=${(evt: CustomEvent) => {
          const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;
          confirm.show(evt.currentTarget as ButtonElement);
        }}
      >
        <foxy-i18n key=${state} infer=""></foxy-i18n>
      </vaadin-button>
    `;
  }

  async submit(): Promise<void> {
    if (this.state === 'busy') return;

    try {
      this.state = 'busy';
      const response = await new NucleonElement.API(this).fetch(this.href, { method: 'POST' });
      this.state = response.ok ? 'idle' : 'fail';
      if (response.ok) this.dispatchEvent(new CustomEvent('done'));
    } catch {
      this.state = 'fail';
    }
  }
}
