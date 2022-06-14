import { css, CSSResultArray } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { get } from 'lodash-es';
import { InternalControl } from '../InternalControl/InternalControl';

/**
 * Internal control displaying creation and last modification date
 * for a hAPI resource in a table.
 *
 * @element foxy-internal-timestamps-control
 * @since 1.17.0
 */
export class InternalTimestampsControl extends InternalControl {
  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .max-w-0 {
          max-width: 0;
        }
      `,
    ];
  }

  renderControl(): TemplateResult {
    return html`
      <table class="font-lumo text-m leading-m w-full">
        <tbody class="divide-y divide-contrast-10">
          <tr>
            <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m">
              <foxy-i18n infer="" key="date_created"></foxy-i18n>
            </td>
            <td class="max-w-0 truncate py-s text-body w-2-3">
              <foxy-i18n
                options=${JSON.stringify({ value: get(this, 'nucleon.form.date_created') })}
                infer=""
                key="date"
              >
              </foxy-i18n>
            </td>
          </tr>
          <tr>
            <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m">
              <foxy-i18n infer="" key="date_modified"></foxy-i18n>
            </td>
            <td class="max-w-0 truncate py-s text-body w-2-3">
              <foxy-i18n
                options=${JSON.stringify({ value: get(this, 'nucleon.form.date_modified') })}
                infer=""
                key="date"
              >
              </foxy-i18n>
            </td>
          </tr>
        </tbody>
      </table>
    `;
  }
}
