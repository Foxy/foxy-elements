import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';
import type { ScopeCollection } from '../../../utils/user-scope';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { getResourceId } from '@foxy.io/sdk/core';
import { canReadCollection } from '../../../utils/user-scope';
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
export class WebhookCard extends ConfigurableMixin(
  TranslatableMixin(InternalCard, 'webhook-card')
)<Data> {
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

  get scopeCollection(): ScopeCollection | null {
    return 'webhooks';
  }

  get isBodyReady(): boolean {
    return (!!this.__statusesLoader?.data || !this.__canReadStatuses) && super.isBodyReady;
  }

  renderBody(): TemplateResult {
    const canReadStatuses = this.__canReadStatuses;
    let statusesLink: string | undefined;

    try {
      const url = new URL(this.data?._links['fx:statuses'].href ?? '');
      url.searchParams.set('order', 'date_created desc');
      url.searchParams.set('limit', '1');

      const resourceId = getResourceId(this.resourceUri ?? '');
      if (resourceId !== null) url.searchParams.set('resource_id', String(resourceId));

      statusesLink = url.toString();
    } catch {
      statusesLink = undefined;
    }

    const recentStatuses = this.__statusesLoader?.data?._embedded['fx:webhook_statuses'];
    const lastStatus = recentStatuses?.[0];
    const cardStatus = recentStatuses ? lastStatus?.status ?? 'none' : 'loading';
    const isActive = !!this.data?.is_active;

    // SDK types are incorrect – this is a string, not an array.
    // TODO remove this cast when SDK is fixed.
    const eventResource = (this.data?.event_resource ?? '') as unknown as string;

    return html`
      <div class="grid grid-cols-1 leading-s -my-xs">
        <p class="flex items-center gap-s justify-between">
          <span class="text-m truncate text-body font-medium">
            ${this.data?.name}&ZeroWidthSpace;
          </span>
          <span class="text-s text-tertiary">
            <foxy-i18n
              class=${classMap({ 'text-success': isActive })}
              infer=""
              key="is_active_${isActive}"
            >
            </foxy-i18n>
          </span>
        </p>

        <p class="text-s truncate text-secondary">${this.data?.url}&ZeroWidthSpace;</p>

        <p class="text-s truncate text-tertiary">
          ${this.resourceUri
            ? ''
            : canReadStatuses
            ? html`<span class="capitalize">${eventResource.replace(/_/g, ' ')}</span> &bull;`
            : html`<span class="capitalize">${eventResource.replace(/_/g, ' ')}</span>`}
          ${canReadStatuses
            ? html`
                <foxy-i18n
                  class=${classMap({ 'text-error': isActive && cardStatus === 'failed' })}
                  infer=""
                  key="status_${cardStatus}"
                  .options=${lastStatus}
                >
                </foxy-i18n>
              `
            : ''}
        </p>
      </div>

      <foxy-nucleon
        class="hidden"
        infer=""
        href=${ifDefined(canReadStatuses ? statusesLink : undefined)}
        id="statusesLoader"
        @update=${() => this.requestUpdate()}
      >
      </foxy-nucleon>
    `;
  }

  // Without access to statuses the card renders without the last status.
  private get __canReadStatuses() {
    return canReadCollection(this.currentUserScope, 'webhooks');
  }

  private get __statusesLoader() {
    type Loader = NucleonElement<Resource<Rels.WebhookStatuses>>;
    return this.renderRoot.querySelector<Loader>('#statusesLoader');
  }
}
