import type { Data, PostResponseData } from './types';
import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const NS = 'integration-form';
const Base = TranslatableMixin(InternalForm, NS);

export class IntegrationForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __postResponse: { attribute: false },
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [({ project_name: v }) => !!v || 'project-name:v8n_required'];
  }

  private __postResponse: PostResponseData | null = null;

  renderBody(): TemplateResult {
    return this.data ? this.__renderSnapshotBody() : this.__renderTemplateBody();
  }

  protected async _fetch<TResult = Data>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    const constructor = this.constructor as typeof IntegrationForm;
    const response = await new constructor.API(this).fetch(...args);
    const method = typeof args[0] === 'string' ? args[1]?.method : args[0].method;
    const url = typeof args[0] === 'string' ? args[0] : args[0].url;

    if (!response.ok) throw response;

    const json = await response.json();
    if (method?.toUpperCase() === 'POST' && url === this.parent) this.__postResponse = json;

    return json;
  }

  private __renderSnapshotBody() {
    const data = this.data as Data;
    const expires = new Date((data.expires ?? 0) * 1000);
    const description = data.project_description?.trim() || this.t('no_description');
    const postResponse = this.__postResponse;

    return html`
      <div class="space-y-xs">
        <div class="font-bold truncate text-xl">${data.project_name}&ZeroWidthSpace;</div>
        <div class="text-secondary">${description}&ZeroWidthSpace;</div>
      </div>

      ${postResponse
        ? html`
            <div
              class="bg-success-10 text-success p-m pb-s space-y-xs leading-s rounded-t-l rounded-b-l"
            >
              <foxy-i18n infer="" class="block" key="post_success_message"></foxy-i18n>
              <vaadin-button
                theme="tertiary contrast"
                class="p-0"
                @click=${() => (this.__postResponse = null)}
              >
                <foxy-i18n infer="" key="post_success_action"></foxy-i18n>
              </vaadin-button>
            </div>
          `
        : ''}

      <table class="font-lumo text-m leading-m w-full">
        <tbody class="divide-y divide-contrast-10">
          ${this.__renderTableRow({
            label: this.__renderI18n('added_by'),
            value: this.__renderMailToLink(data.added_by_email, data.added_by_name),
          })}
          ${this.__renderTableRow({
            label: this.__renderI18n('contact'),
            value: this.__renderMailToLink(data.contact_email, data.contact_name),
          })}
          ${this.__renderTableRow({
            label: this.__renderI18n('company'),
            value: this.__renderMailToLink(data.company_url, data.company_name),
          })}
          ${this.__renderTableRow({
            label: this.__renderI18n('expires'),
            value: this.__renderI18n('expires_date', { date: expires }),
          })}
          ${this.__renderTableRow({
            label: 'Client ID',
            value: this.__renderCopiableText(data.client_id),
          })}
          ${postResponse
            ? html`
                ${this.__renderTableRow({
                  highlight: true,
                  label: 'Client secret',
                  value: this.__renderCopiableText(postResponse.client_secret),
                })}
                ${this.__renderTableRow({
                  highlight: true,
                  label: 'Refresh token',
                  value: this.__renderCopiableText(postResponse.refresh_token),
                })}
                ${this.__renderTableRow({
                  highlight: true,
                  label: 'Access token',
                  value: this.__renderCopiableText(postResponse.client_secret),
                })}
              `
            : ''}
          ${this.__renderTableRow({ label: 'Scope', value: html`<code>${data.scope}</code>` })}
        </tbody>
      </table>

      <foxy-internal-delete-control infer="delete"></foxy-internal-delete-control>
    `;
  }

  private __renderTemplateBody() {
    return html`
      <foxy-internal-text-control infer="project-name"></foxy-internal-text-control>

      <foxy-internal-text-area-control infer="project-description">
      </foxy-internal-text-area-control>

      <foxy-internal-create-control infer="create"></foxy-internal-create-control>
    `;
  }

  private __renderTableRow(params: { label: unknown; value: unknown; highlight?: boolean }) {
    const { label, value, highlight = false } = params;
    return html`
      <tr class=${classMap({ 'font-semibold text-success': highlight })}>
        <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m">${label}</td>
        <td class="max-w-0 truncate py-s text-body w-2-3">${value}</td>
      </tr>
    `;
  }

  private __renderMailToLink(email: string, caption: string) {
    if (!email) return html`${caption}`;

    return html`
      <a
        target="_blank"
        class="font-semibold text-primary rounded hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50"
        href="mailto:${email}"
      >
        ${caption}
      </a>
    `;
  }

  private __renderI18n(key: string, options?: unknown) {
    return html`<foxy-i18n infer="" key=${key} .options=${options}></foxy-i18n>`;
  }

  private __renderCopiableText(text: string) {
    return html`
      <div class="flex items-center gap-s">
        <code class="truncate flex-1">${text}</code>
        <foxy-copy-to-clipboard infer="copy-to-clipboard" class="inline-block" text=${text}>
        </foxy-copy-to-clipboard>
      </div>
    `;
  }
}
