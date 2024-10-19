import type { TemplateResult } from 'lit-html';

import { InternalControl } from '../InternalControl/InternalControl';
import { html } from 'lit-html';
import { get } from 'lodash-es';

/**
 * Internal control displaying creation and last modification date
 * for a hAPI resource in a table.
 *
 * @element foxy-internal-timestamps-control
 * @since 1.17.0
 */
export class InternalTimestampsControl extends InternalControl {
  renderControl(): TemplateResult {
    return html`
      <p class="font-lumo text-s leading-s text-secondary">
        <foxy-i18n infer="" key="date_created"></foxy-i18n>
        <foxy-i18n
          .options=${{ value: get(this, 'nucleon.data.date_created') }}
          infer=""
          key="date"
        >
        </foxy-i18n>
        <span>&bull;<span>
        <foxy-i18n infer="" key="date_modified"></foxy-i18n>
        <foxy-i18n
          .options=${{ value: get(this, 'nucleon.data.date_modified') }}
          infer=""
          key="date"
        >
        </foxy-i18n>
      </p>
    `;
  }
}
