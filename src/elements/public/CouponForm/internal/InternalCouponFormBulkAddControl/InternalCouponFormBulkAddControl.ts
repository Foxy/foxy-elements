import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { FormDialog } from '../../../FormDialog/FormDialog';
import type { CouponForm } from '../../CouponForm';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalCouponFormBulkAddControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      parent: {},
      form: {},
    };
  }

  parent: string | null = null;

  form: string | null = null;

  renderControl(): TemplateResult {
    const nucleon = this.nucleon as CouponForm | undefined;
    const codesHref = nucleon?.data?._links['fx:coupon_codes'].href;

    return html`
      <foxy-form-dialog
        header="header"
        parent=${ifDefined(this.parent ?? undefined)}
        infer="dialog"
        form=${ifDefined(this.form ?? undefined)}
        alert
        .related=${codesHref ? [codesHref] : []}
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
