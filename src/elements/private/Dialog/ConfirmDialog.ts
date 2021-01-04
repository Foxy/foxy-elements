import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { Dialog } from './Dialog';
import { I18N } from '../I18N/I18N';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

export class ConfirmDialog extends Dialog {
  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'vaadin-button': ButtonElement,
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      confirm: { type: String },
      message: { type: String },
      cancel: { type: String },
      theme: { type: String },
    };
  }

  readonly closable = false;

  readonly editable = false;

  readonly alert = true;

  confirm = 'confirm';

  message = 'message';

  cancel = 'cancel';

  theme = 'primary';

  render(): TemplateResult {
    return super.render(
      () => html`
        <x-i18n
          .ns=${this.ns}
          .lang=${this.lang}
          .key=${this.message}
          class="font-lumo text-m text-body text-center mb-m"
        >
        </x-i18n>

        <div class="grid grid-cols-2 gap-m">
          <vaadin-button @click=${this.__handleCancel}>
            <x-i18n .ns=${this.ns} .lang=${this.lang} .key=${this.cancel}></x-i18n>
          </vaadin-button>

          <vaadin-button theme=${this.theme} @click=${this.__handleConfirm}>
            <x-i18n .ns=${this.ns} .lang=${this.lang} .key=${this.confirm}></x-i18n>
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
    this.dispatchEvent(new Dialog.SubmitEvent());
  }
}
