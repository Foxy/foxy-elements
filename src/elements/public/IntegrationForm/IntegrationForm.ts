import type { Data, PostResponseData } from './types';
import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
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

    return html`
      <dl class="grid grid-cols-1 gap-s">
        <dt class="sr-only">${this.t('title_description')}</dt>
        <dd class="font-bold truncate text-xl">${data.project_name}&ZeroWidthSpace;</dd>

        <dt class="sr-only">${this.t('subtitle_description')}</dt>
        <dd class="text-secondary">${description}&ZeroWidthSpace;</dd>
      </dl>

      ${this.__postResponse
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
          <tr>
            <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m font-semibold">
              <foxy-i18n infer="" key="added_by"></foxy-i18n>
            </td>
            <td class="max-w-0 truncate py-s text-body w-2-3">
              ${data.added_by_email
                ? html`
                    <a
                      target="_blank"
                      class="font-semibold text-primary rounded hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50"
                      href="mailto:${data.added_by_email}"
                    >
                      ${data.added_by_name}
                    </a>
                  `
                : data.added_by_name}
            </td>
          </tr>

          <tr>
            <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m font-semibold">
              <foxy-i18n infer="" key="contact"></foxy-i18n>
            </td>
            <td class="max-w-0 truncate py-s text-body w-2-3">
              ${data.contact_email
                ? html`
                    <a
                      target="_blank"
                      class="font-semibold text-primary rounded hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50"
                      href="mailto:${data.contact_email}"
                    >
                      ${data.contact_name}
                    </a>
                  `
                : data.contact_name}
            </td>
          </tr>

          <tr>
            <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m font-semibold">
              <foxy-i18n infer="" key="company"></foxy-i18n>
            </td>
            <td class="max-w-0 truncate py-s text-body w-2-3">
              ${data.company_url
                ? html`
                    <a
                      target="_blank"
                      class="font-semibold text-primary rounded hover-underline focus-outline-none focus-ring-2 focus-ring-primary-50"
                      href=${data.company_url}
                    >
                      ${data.company_name}
                    </a>
                  `
                : data.company_name}
            </td>
          </tr>

          <tr>
            <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m font-semibold">
              <foxy-i18n infer="" key="expires"></foxy-i18n>
            </td>
            <td class="max-w-0 truncate py-s text-body w-2-3">
              <foxy-i18n infer="" key="expires_date" .options=${{ date: expires }}></foxy-i18n>
            </td>
          </tr>

          <tr>
            <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m font-semibold">Client ID</td>
            <td class="max-w-0 truncate py-s text-body w-2-3">
              <div class="flex items-center gap-s">
                <code class="truncate flex-1">${data.client_id}</code>
                <foxy-copy-to-clipboard
                  infer="copy-to-clipboard"
                  class="inline-block"
                  text=${data.client_id}
                >
                </foxy-copy-to-clipboard>
              </div>
            </td>
          </tr>

          ${this.__postResponse
            ? html`
                <tr class="font-semibold text-success">
                  <td class="max-w-0 truncate py-s w-1-3 pr-m font-semibold">Client secret</td>
                  <td class="max-w-0 py-s w-2-3">
                    <div class="flex items-center gap-s">
                      <code class="truncate flex-1">${this.__postResponse.client_secret}</code>
                      <foxy-copy-to-clipboard
                        infer="copy-to-clipboard"
                        class="inline-block"
                        text=${this.__postResponse.client_secret}
                      >
                      </foxy-copy-to-clipboard>
                    </div>
                  </td>
                </tr>

                <tr class="font-semibold text-success">
                  <td class="max-w-0 truncate py-s w-1-3 pr-m font-semibold">Refresh token</td>
                  <td class="max-w-0 py-s w-2-3">
                    <div class="flex items-center gap-s">
                      <code class="truncate flex-1">${this.__postResponse.refresh_token}</code>
                      <foxy-copy-to-clipboard
                        infer="copy-to-clipboard"
                        class="inline-block"
                        text=${this.__postResponse.refresh_token}
                      >
                      </foxy-copy-to-clipboard>
                    </div>
                  </td>
                </tr>

                <tr class="font-semibold text-success">
                  <td class="max-w-0 truncate py-s w-1-3 pr-m font-semibold">Access token</td>
                  <td class="max-w-0 py-s w-2-3">
                    <div class="flex items-center gap-s">
                      <code class="truncate flex-1">${this.__postResponse.access_token}</code>
                      <foxy-copy-to-clipboard
                        infer="copy-to-clipboard"
                        class="inline-block"
                        text=${this.__postResponse.access_token}
                      >
                      </foxy-copy-to-clipboard>
                    </div>
                  </td>
                </tr>
              `
            : ''}

          <tr>
            <td class="max-w-0 truncate py-s text-secondary w-1-3 pr-m font-semibold">Scope</td>
            <td class="max-w-0 truncate py-s text-body w-2-3"><code>${data.scope}</code></td>
          </tr>
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
}
