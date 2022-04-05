import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { TranslatableMixin } from '../../../mixins/translatable';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';

/**
 * Basic card displaying a report.
 *
 * @slot title:before
 * @slot title:after
 *
 * @slot subtitle:before
 * @slot subtitle:after
 *
 * @element foxy-report-card
 * @since 1.11.0
 */
export class ReportCard extends TranslatableMixin(TwoLineCard, 'report-card')<Data> {
  private __downloadUrl = '';

  render(): TemplateResult {
    return super.render({
      title: data => html`
        ${data.name} - ${data.version} -
        <foxy-i18n
          options=${JSON.stringify({ value: data.datetime_start })}
          lang=${this.lang}
          key="date"
          ns=${this.ns}
        >
        </foxy-i18n>
        /
        <foxy-i18n
          options=${JSON.stringify({ value: data.datetime_end })}
          lang=${this.lang}
          key="date"
          ns=${this.ns}
        >
        </foxy-i18n>
      `,
      subtitle: data => html`
        <a
          target="_blank"
          class="font-semibold text-primary hover-underline"
          href=${this.__downloadUrl}
          rel="nofollow noopener noreferrer"
        >
          Download
        </a>
      `,
    });
  }

  protected async _sendGet(): Promise<Data> {
    const report = await super._sendGet();

    if (report.status === 'ready') {
      this.__downloadUrl = report['_links']['fx:download_url']['href'];
    }

    return report;
  }
}
