import { html, TemplateResult } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { FormDialog } from '../../../FormDialog/FormDialog';

export class InternalTransactionCustomerControl extends InternalControl {
  renderControl(): TemplateResult {
    return html`
      <foxy-internal-details summary="customer" infer="" open>
        <foxy-form-dialog
          header="header"
          infer="dialog"
          form="foxy-customer"
          href=${ifDefined(this.nucleon?.data?._links['fx:customer'].href)}
          id="dialog"
        >
        </foxy-form-dialog>

        <button
          class="w-full text-left block rounded-b-l transition-colors hover-bg-contrast-5 focus-outline-none focus-ring-2 focus-ring-primary-50"
          @click=${(evt: Event) => {
            const dialog = this.renderRoot.querySelector('#dialog') as FormDialog;
            dialog.show(evt.currentTarget as HTMLButtonElement);
          }}
        >
          <foxy-customer-card
            infer="card"
            class="p-m"
            href=${ifDefined(this.nucleon?.data?._links['fx:customer'].href)}
          >
          </foxy-customer-card>
        </button>
      </foxy-internal-details>
    `;
  }
}
