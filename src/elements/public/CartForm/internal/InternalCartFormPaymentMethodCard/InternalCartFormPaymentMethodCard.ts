import type { TemplateResult } from 'lit-html';
import type { Data } from './types';

import { getResourceId } from '@foxy.io/sdk/core';
import { TwoLineCard } from '../../../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

export class InternalCartFormPaymentMethodCard extends TwoLineCard<Data> {
  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => {
        const payment = data._embedded?.['fx:payments']?.[0];
        const type = payment?.cc_type ?? '';
        const year = payment?.cc_exp_year?.substring(2);
        const month = payment?.cc_exp_month;
        const last4Digits = payment?.cc_number_masked?.replace(/x/gi, '');
        const options = {
          last4Digits,
          context: type && year && month && last4Digits ? 'valid' : 'invalid',
          month,
          type,
          year,
        };

        return html`<foxy-i18n infer="" key="title" .options=${options}></foxy-i18n>`;
      },

      subtitle: data => {
        const payment = data._embedded?.['fx:payments']?.[0];
        const options = {
          id: getResourceId(data._links.self.href),
          date: payment?.date_created ?? data.transaction_date,
        };

        return html`<foxy-i18n infer="" key="subtitle" .options=${options}></foxy-i18n>`;
      },
    });
  }
}
