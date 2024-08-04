import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Data } from './types';

import { InternalForm } from '../../../../internal/InternalForm/InternalForm';
import { UpdateEvent } from '../../../NucleonElement/UpdateEvent';
import { ifDefined } from 'lit-html/directives/if-defined';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit-html';

export class InternalCartFormPaymentMethodForm extends InternalForm<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      defaultPaymentMethod: { attribute: 'default-payment-method' },
      paymentCardEmbedUrl: { attribute: 'payment-card-embed-url' },
      selectionProps: { attribute: false },
    };
  }

  /** URL of the `fx:default_payment_method` resource. */
  defaultPaymentMethod: string | null = null;

  /** Complete configuration URL for the Payment Card Embed. */
  paymentCardEmbedUrl: string | null = null;

  /** Props/event listeners to add to the selection list. */
  selectionProps: Record<PropertyKey, unknown> = {};

  renderBody(): TemplateResult {
    return html`
      <foxy-update-payment-method-form
        embed-url=${ifDefined(this.paymentCardEmbedUrl ?? void 0)}
        infer="default-payment-method"
        href=${ifDefined(this.defaultPaymentMethod ?? void 0)}
        @update=${(evt: UpdateEvent) => {
          if (evt.detail?.result === UpdateEvent.UpdateResult.ResourceUpdated) {
            this.edit({ selection: '' });
            this.submit();
          }
        }}
      >
      </foxy-update-payment-method-form>

      <div class="flex items-center gap-m">
        <div class="border-t border-contrast-10 flex-1"></div>
        <foxy-i18n class="text-tertiary" infer="" key="or"></foxy-i18n>
        <div class="border-t border-contrast-10 flex-1"></div>
      </div>

      <h2 class="text-xl font-medium">
        <foxy-i18n infer="" key="select_previous"></foxy-i18n>
      </h2>

      <foxy-internal-async-list-control
        infer="selection"
        limit="5"
        form="foxy-null"
        hide-delete-button
        hide-create-button
        @itemclick=${(evt: CustomEvent<string>) => {
          evt.preventDefault();
          this.edit({ selection: evt.detail });
          this.submit();
        }}
        ...=${spread(this.selectionProps)}
      >
      </foxy-internal-async-list-control>
    `;
  }
}
