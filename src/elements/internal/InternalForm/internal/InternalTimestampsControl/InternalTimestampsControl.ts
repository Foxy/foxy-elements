import { css, CSSResultArray } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { get } from 'lodash-es';
import { InternalControl } from '../../../InternalControl/InternalControl';

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

  infer = 'timestamps';

  renderControl(): TemplateResult {
    return html`
      <table class="font-lumo text-m leading-m w-full">
        <tbody class="divide-y divide-contrast-10">
          <tr>
            <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m">
              <foxy-i18n lang=${this.lang} key="date_created" ns=${this.ns}></foxy-i18n>
            </td>
            <td class="max-w-0 truncate py-s text-body w-2-3">
              <foxy-i18n
                options=${JSON.stringify({ value: get(this, 'nucleon.form.date_created') })}
                lang=${this.lang}
                key="date"
                ns=${this.ns}
              >
              </foxy-i18n>
            </td>
          </tr>
          <tr>
            <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m">
              <foxy-i18n lang=${this.lang} key="date_modified" ns=${this.ns}></foxy-i18n>
            </td>
            <td class="max-w-0 truncate py-s text-body w-2-3">
              <foxy-i18n
                options=${JSON.stringify({ value: get(this, 'nucleon.form.date_modified') })}
                lang=${this.lang}
                key="date"
                ns=${this.ns}
              >
              </foxy-i18n>
            </td>
          </tr>
        </tbody>
      </table>
    `;
  }
}
