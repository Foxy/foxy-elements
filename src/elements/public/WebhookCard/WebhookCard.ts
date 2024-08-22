import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { getResourceId } from '@foxy.io/sdk/core';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

/**
 * Basic card displaying webhook (`fx:webhook`) info.
 *
 * @element foxy-webhook-card
 * @since 1.17.0
 */
export class WebhookCard extends TranslatableMixin(InternalCard, 'webhook-card')<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      resourceUri: { attribute: 'resource-uri' },
    };
  }

  /**
   * Optional URI of a transaction, customer or subscription. When provided,
   * the form will display logs and statuses for that particular resource only.
   */
  resourceUri: string | null = null;

  renderBody(): TemplateResult {
    let statusesLink: string | undefined = undefined;

    try {
      const resourceId = getResourceId(this.resourceUri ?? '');
      const url = new URL(this.data?._links['fx:statuses'].href ?? '');

      if (resourceId !== null) {
        url.searchParams.set('resource_id', String(resourceId));
        url.searchParams.set('order', 'date_created desc');
        url.searchParams.set('limit', '1');
        statusesLink = url.toString();
      }
    } catch {
      // ignore
    }

    const statusesLoader = this.__statusesLoader;
    const lastStatus = statusesLoader?.data?._embedded['fx:webhook_statuses'][0];

    return html`
      <div class="grid grid-cols-1 leading-s -my-xs">
        <p class="flex items-center gap-s justify-between">
          <span class="text-m truncate text-body font-medium">
            ${this.data?.name}&ZeroWidthSpace;
          </span>
          <foxy-i18n
            class=${classMap({
              'text-tertiary': !lastStatus || lastStatus.status === 'pending',
              'text-success': lastStatus?.status === 'successful',
              'text-error': lastStatus?.status === 'failed',
              'hidden': !statusesLoader?.data,
              'text-s': true,
            })}
            infer=""
            key="status_${lastStatus?.status ?? 'none'}"
          >
          </foxy-i18n>
        </p>

        <p class="text-s truncate text-secondary">${this.data?.url}&ZeroWidthSpace;</p>

        ${this.resourceUri === null
          ? html`
              <p class="text-s truncate text-tertiary">
                ${this.data?.format} &bull; ${this.data?.event_resource}&ZeroWidthSpace;
              </p>
            `
          : ''}
      </div>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(statusesLink)}
        id="statusesLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  private get __statusesLoader() {
    type Loader = NucleonElement<Resource<Rels.WebhookStatuses>>;
    return this.renderRoot.querySelector<Loader>('#statusesLoader');
  }
}
