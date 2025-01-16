import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { getGravatarUrl } from '../../../utils/get-gravatar-url';
import { asyncReplace } from 'lit-html/directives/async-replace';
import { TwoLineCard } from '../CustomFieldCard/TwoLineCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const NS = 'user-card';
const Base = TranslatableMixin(TwoLineCard, NS);

/**
 * Card element representing a `fx:user` resource.
 *
 * @element foxy-user-card
 * @since 1.22.0
 */
export class UserCard extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      showInvitations: { type: Boolean, attribute: 'show-invitations' },
    };
  }

  /** When true, displays the number of unanswered invitations next to profile picture if there are some. */
  showInvitations = false;

  renderBody(): TemplateResult {
    const invitationsCount = this.__invitationsLoader?.data?.total_items ?? 0;

    return html`
      <div
        class="flex items-center"
        style="gap: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
      >
        <div class="relative flex-shrink-0">
          ${asyncReplace(this.__getGravatar(this.data?.email))}
          <span
            data-testid="invitations-count"
            style="min-height: 1.5em; min-width: 1.5em; border-radius: 1.5em; left: calc(100% - 1em); top: -0.5em;"
            class=${classMap({
              'flex items-center justify-center bg-error text-error-contrast': true,
              'font-medium px-xs leading-none text-xs absolute transform': true,
              'scale-0': !this.showInvitations || invitationsCount === 0,
            })}
          >
            ${invitationsCount}
          </span>
        </div>
        <div class="min-w-0 flex-1">
          ${super.renderBody({
            title: data => {
              const name = [data.first_name.trim(), data.last_name.trim()];
              return html`${name.filter(v => !!v).join(' ') || this.t('no_name')}`;
            },
            subtitle: data => html`${data.email}`,
          })}
        </div>
      </div>

      <foxy-nucleon
        infer=""
        href=${ifDefined(this.__invitationsHref)}
        id="invitationsLoader"
        @update=${this.requestUpdate}
      >
      </foxy-nucleon>
    `;
  }

  private get __invitationsLoader() {
    type Loader = NucleonElement<Resource<Rels.UserInvitations>>;
    return this.renderRoot.querySelector<Loader>('#invitationsLoader');
  }

  private get __invitationsHref() {
    try {
      if (!this.showInvitations) return;
      const url = new URL(this.data?._links['fx:user_invitations'].href ?? '');
      url.searchParams.set('status', 'sent');
      url.searchParams.set('limit', '1');
      return url.toString();
    } catch {
      return;
    }
  }

  private async *__getGravatar(email?: string) {
    yield html`<div class="rounded-full w-s h-s bg-contrast-5"></div>`;

    if (email) {
      yield html`
        <img
          class="rounded-full w-s h-s bg-contrast-5 shadow-xs"
          src=${await getGravatarUrl(email)}
          alt=""
        />
      `;
    }
  }
}
