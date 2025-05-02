import type { AdminSubscriptionForm } from '../../AdminSubscriptionForm';
import type { DialogHideEvent } from '../../../../private/Dialog/DialogHideEvent';
import type { TemplateResult } from 'lit-html';
import type { FormDialog } from '../../../FormDialog/FormDialog';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

export class InternalAdminSubscriptionFormStatusAction extends InternalControl {
  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = [super.hiddenSelector.toString()];
    alwaysMatch.unshift('form:save-button');
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderControl(): TemplateResult {
    const nucleon = this.nucleon as AdminSubscriptionForm | null;
    const endDate = nucleon?.data?.end_date;
    const isActive = nucleon?.data?.is_active;
    const isCancelled = endDate && endDate !== '0000-00-00';
    const status = isActive ? (isCancelled ? 'uncancel' : 'cancel') : 'reactivate';
    const showActionForm = !isActive || !endDate || endDate === '0000-00-00';

    return html`
      <vaadin-button
        theme="tertiary-inline${showActionForm ? (isActive ? ' error' : ' success') : ''}"
        @click=${(evt: Event) => {
          const button = evt.currentTarget as HTMLElement;
          this.renderRoot.querySelector<FormDialog>('#dialog')?.show(button);
        }}
      >
        <foxy-i18n infer="" key="caption_${status}"></foxy-i18n>
      </vaadin-button>

      ${showActionForm
        ? html`
            <foxy-form-dialog
              infer="form"
              form="foxy-internal-admin-subscription-form-status-action-form"
              href=${ifDefined(nucleon?.href)}
              no-confirm-when-dirty
              close-on-patch
              alert
              id="dialog"
            >
            </foxy-form-dialog>
          `
        : html`
            <foxy-internal-confirm-dialog
              message="uncancel_message"
              confirm="uncancel_confirm"
              cancel="uncancel_cancel"
              header="uncancel_header"
              infer=""
              id="dialog"
              @hide=${(evt: DialogHideEvent) => {
                if (!evt.detail.cancelled) {
                  this.nucleon?.edit({ end_date: '0000-00-00' });
                  this.nucleon?.submit();
                }
              }}
            >
            </foxy-internal-confirm-dialog>
          `}
    `;
  }
}
