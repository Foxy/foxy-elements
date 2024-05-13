import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { FormDialog } from '../../public/FormDialog/FormDialog';

import { InternalControl } from '../InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalBulkAddActionControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      related: { type: Array },
      parent: {},
      form: {},
    };
  }

  related: string[] = [];

  parent: string | null = null;

  form: string | null = null;

  renderControl(): TemplateResult {
    return html`
      <foxy-form-dialog
        header="header"
        parent=${ifDefined(this.parent ?? undefined)}
        infer="dialog"
        form=${ifDefined(this.form ?? undefined)}
        alert
        .related=${this.related}
      >
      </foxy-form-dialog>

      <vaadin-button
        theme="tertiary-inline"
        ?disabled=${this.disabled}
        @click=${(evt: Event) => {
          const dialog = this.renderRoot.querySelector('foxy-form-dialog') as FormDialog | null;
          const button = evt.target as HTMLElement;

          if (dialog) {
            dialog.href = '';
            dialog.show(button);
          }
        }}
      >
        <foxy-i18n infer="" key="button_text"></foxy-i18n>
      </vaadin-button>
    `;
  }
}
