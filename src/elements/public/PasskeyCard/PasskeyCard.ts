import type { TemplateResult } from 'lit-element';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { html } from 'lit-html';

import uainfer from 'uainfer/src/uainfer.js';

const NS = 'passkey-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Basic card displaying a saved passkey.
 *
 * @element foxy-passkey-card
 * @since 1.24.0
 */
export class PasskeyCard extends Base<Data> {
  renderBody(): TemplateResult {
    return super.renderBody({
      title: data => html`${data.credential_id}`,
      subtitle: data => {
        let options: any;
        let key: string;

        if (data.last_login_date && data.last_login_ua) {
          options = {
            last_login_date: new Date(data.last_login_date),
            last_login_ua: uainfer.analyze(data.last_login_ua).toString(),
          };
          key = 'subtitle';
        } else {
          options = {};
          key = 'subtitle_no_data';
        }

        return html`<foxy-i18n infer="" key=${key} .options=${options}></foxy-i18n>`;
      },
    });
  }
}
