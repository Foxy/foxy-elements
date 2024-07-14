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

/**
 * Form element for managing integrations (`fx:integration`).
 *
 * @element foxy-integration-form
 * @since 1.21.0
 */
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
    const hiddenSelector = this.hiddenSelector;
    const postResponse = this.__postResponse;

    return html`
      ${hiddenSelector.matches('header', true) ? '' : this.__renderHeader()}
      ${hiddenSelector.matches('message', true) || !postResponse ? '' : this.__renderMessage()}
      ${hiddenSelector.matches('table') ? '' : this.__renderTable()}
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

  private __renderMessage() {
    return html`
      ${this.renderTemplateOrSlot('message:before')}

      <div class="bg-success-10 text-success p-m pb-s space-y-xs leading-s rounded-t-l rounded-b-l">
        <foxy-i18n infer="message" class="block" key="text"></foxy-i18n>
        <vaadin-button
          data-testid="message-action"
          theme="tertiary contrast"
          class="p-0"
          ?disabled=${this.disabledSelector.matches('message', true)}
          @click=${() => (this.__postResponse = null)}
        >
          <foxy-i18n infer="message" key="action"></foxy-i18n>
        </vaadin-button>
      </div>

      ${this.renderTemplateOrSlot('message:after')}
    `;
  }

  private __renderHeader() {
    const data = this.data as Data;
    const noDescription = html`<foxy-i18n infer="header" key="no_description"></foxy-i18n>`;

    return html`
      <div>
        ${this.renderTemplateOrSlot('header:before')}

        <div class="space-y-xs">
          <div class="font-medium truncate text-xl">${data.project_name}&ZeroWidthSpace;</div>
          <div class="text-secondary">${data.project_description || noDescription}</div>
        </div>

        ${this.renderTemplateOrSlot('header:after')}
      </div>
    `;
  }

  private __renderTable() {
    const data = this.data as Data;
    const expires = new Date((data.expires ?? 0) * 1000);
    const postResponse = this.__postResponse;

    return html`
      ${this.renderTemplateOrSlot('table:before')}

      <table class="font-lumo text-m leading-m w-full">
        <tbody class="divide-y divide-contrast-10">
          ${this.__renderTableRow({
            label: this.__renderTableI18n('added_by'),
            value: this.__renderMailToLink(data.added_by_email, data.added_by_name),
          })}
          ${this.__renderTableRow({
            label: this.__renderTableI18n('contact'),
            value: this.__renderMailToLink(data.contact_email, data.contact_name),
          })}
          ${this.__renderTableRow({
            label: this.__renderTableI18n('company'),
            value: this.__renderLink(data.company_url, data.company_name),
          })}
          ${this.__renderTableRow({
            label: this.__renderTableI18n('expires'),
            value: this.__renderTableI18n('expires_date', { date: expires }),
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
                  value: this.__renderCopiableText(postResponse.access_token),
                })}
              `
            : ''}
          ${this.__renderTableRow({ label: 'Scope', value: html`<code>${data.scope}</code>` })}
        </tbody>
      </table>

      ${this.renderTemplateOrSlot('table:after')}
    `;
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

  private __renderMailToLink(email: string, caption: string) {
    if (!email) return html`${caption}`;
    return this.__renderLink(`mailto:${email}`, caption);
  }

  private __renderLink(href: string, caption: string) {
    if (!href) return html`${caption}`;

    return html`
      <a
        target="_blank"
        class="font-medium text-primary rounded hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50"
        href=${href}
      >
        ${caption}
      </a>
    `;
  }

  private __renderTableRow(params: { label: unknown; value: unknown; highlight?: boolean }) {
    const { label, value, highlight = false } = params;
    return html`
      <tr class=${classMap({ 'font-medium text-success': highlight })}>
        <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m">${label}</td>
        <td class="max-w-0 truncate py-s text-body w-2-3">${value}</td>
      </tr>
    `;
  }

  private __renderTableI18n(key: string, options?: unknown) {
    return html`<foxy-i18n infer="table" key=${key} .options=${options}></foxy-i18n>`;
  }
}
