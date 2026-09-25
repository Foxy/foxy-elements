import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { getGravatarUrl } from '../../../utils/get-gravatar-url';
import { groupInvitationScopes } from '../../../utils/group-invitation-scopes';
import { getResourceId } from '@foxy.io/sdk/core';
import { asyncReplace } from 'lit-html/directives/async-replace';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { html } from 'lit-html';

const NS = 'user-invitation-card';
const Base = TranslatableMixin(InternalCard, NS);

export class UserInvitationCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      defaultDomain: { attribute: 'default-domain' },
      layout: {},
    };
  }

  /** Default host domain for stores that don't use a custom domain name, e.g. `foxycart.com`. */
  defaultDomain: string | null = null;

  /** Admin layout will display user info, user layout (default) will display store info. */
  layout: 'admin' | 'user' | null = null;

  renderBody(): TemplateResult {
    const layout = this.layout ?? 'user';

    if (layout === 'admin') {
      const { first_name, last_name, status, email } = this.data ?? {};
      const hasName = first_name?.trim() || last_name?.trim();
      const titleOptions = { first_name, last_name, context: hasName ? '' : 'empty' };
      const subtitleOptions = { context: `admin_${status}`, email };
      const userLink = this.data?._links['fx:user']?.href;

      return html`
        <div
          class="flex items-start"
          style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
        >
          ${asyncReplace(this.__getGravatar(this.data?.email))}

          <div class="min-w-0 flex-1 leading-xs">
            <div class="flex items-center">
              <foxy-i18n
                class="font-medium truncate mr-auto"
                infer=""
                key="full_name"
                .options=${titleOptions}
              >
              </foxy-i18n>
              ${userLink
                ? html`
                    <span class="text-tertiary uppercase text-s flex-shrink-0">
                      ID ${getResourceId(userLink)}
                    </span>
                  `
                : ''}
            </div>
            <foxy-i18n
              .options=${subtitleOptions}
              class="block truncate text-s text-secondary"
              infer=""
              key="status"
            >
            </foxy-i18n>
            ${this.__renderScopes()}
          </div>
        </div>
      `;
    }

    const storeLink = this.data?._links['fx:store'].href;
    const defaultD = this.defaultDomain;
    const d = this.data?.store_domain;
    const domain = d?.includes('.') || !defaultD ? d : `${d}.${defaultD}`;
    const subtitleOptions = { context: `user_${this.data?.status}`, domain };

    return html`
      <div class="min-w-0 flex-1 leading-xs">
        <div class="flex items-center">
          <span class="font-medium truncate mr-auto">
            ${this.data?.store_name}&ZeroWidthSpace;
          </span>
          ${storeLink
            ? html`
                <span class="text-tertiary uppercase text-s flex-shrink-0">
                  ID ${getResourceId(storeLink)}
                </span>
              `
            : ''}
        </div>
        <foxy-i18n
          .options=${subtitleOptions}
          class="block truncate text-s text-secondary"
          infer=""
          key="status"
        >
        </foxy-i18n>
      </div>
    `;
  }

  /** Renders the scope summary lines, or nothing when the invitation grants nothing. */
  private __renderScopes(): TemplateResult | string {
    const groups = groupInvitationScopes(this.data?.scope);

    const hasScopes =
      groups.storeFullAccess ||
      !!groups.full.length ||
      !!groups.read.length ||
      !!groups.resend.length;

    // Bail before the wrapper so an invitation that grants nothing renders no separator
    // and no empty block — the card looks exactly as it did before this feature.
    if (!hasScopes) return '';

    // The separator lives here rather than beside the subtitle so it only ever appears
    // when there is something below it to separate.
    return html`
      <div class="border-t border-contrast-10 mt-s pt-s">
        ${groups.storeFullAccess
          ? html`
              <foxy-i18n
                class="block truncate text-s text-secondary"
                infer=""
                key="scope_store_full_access"
              >
              </foxy-i18n>
            `
          : html`
              ${this.__renderScopeLine('scope_full', groups.full)}
              ${this.__renderScopeLine('scope_read', groups.read)}
              ${this.__renderScopeLine('scope_resend', groups.resend)}
            `}
      </div>
    `;
  }

  /**
   * Renders one scope line: up to three localized collection names sorted alphabetically,
   * with the remainder reported through the `_truncated` i18next context. Returns nothing
   * for an empty group so no blank line is rendered.
   */
  private __renderScopeLine(key: string, collections: string[]): TemplateResult | string {
    if (!collections.length) return '';

    const labels = collections.map(collection => this.t(`scopes.${collection}`)).sort();
    const count = Math.max(0, labels.length - 3);
    const options = {
      names: labels.slice(0, 3).join(', '),
      count,
      context: count ? 'truncated' : '',
    };

    return html`
      <foxy-i18n
        .options=${options}
        class="block truncate text-s text-secondary"
        infer=""
        key=${key}
      >
      </foxy-i18n>
    `;
  }

  private async *__getGravatar(email?: string) {
    yield html`<div class="flex-shrink-0 rounded-full w-s h-s bg-contrast-5"></div>`;

    if (email) {
      yield html`
        <img
          class="flex-shrink-0 rounded-full w-s h-s bg-contrast-5 shadow-xs"
          src=${await getGravatarUrl(email)}
          alt=""
        />
      `;
    }
  }
}
