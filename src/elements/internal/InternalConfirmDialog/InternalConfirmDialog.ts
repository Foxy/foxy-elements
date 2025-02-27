import { TemplateResult, html } from 'lit-html';

import { Dialog } from '../../private/Dialog/Dialog';
import { PropertyDeclarations } from 'lit-element';

export class InternalConfirmDialog extends Dialog {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      messageOptions: { type: Object, attribute: 'message-options' },
      confirm: { type: String },
      message: { type: String },
      cancel: { type: String },
      theme: { type: String },
    };
  }

  readonly closable = false;

  readonly editable = false;

  readonly alert = true;

  messageOptions: Record<string, string> = {};

  confirm = 'confirm';

  message = 'message';

  cancel = 'cancel';

  theme = 'primary';

  render(): TemplateResult {
    return super.render(
      () => html`
        <foxy-i18n
          class="block font-lumo text-m text-body text-center mb-m"
          lang=${this.lang}
          key=${this.message}
          ns=${this.ns}
          .options=${this.messageOptions}
        >
        </foxy-i18n>

        <div class="grid grid-cols-2 gap-m">
          <vaadin-button data-testid="cancelButton" @click=${this.__handleCancel}>
            <foxy-i18n ns=${this.ns} lang=${this.lang} key=${this.cancel}></foxy-i18n>
          </vaadin-button>

          <vaadin-button
            theme=${this.theme}
            data-testid="confirmButton"
            @click=${this.__handleConfirm}
          >
            <foxy-i18n ns=${this.ns} lang=${this.lang} key=${this.confirm}></foxy-i18n>
          </vaadin-button>
        </div>
      `
    );
  }

  private async __handleCancel() {
    await this.hide(true);
  }

  private async __handleConfirm() {
    await this.hide();
  }
}
