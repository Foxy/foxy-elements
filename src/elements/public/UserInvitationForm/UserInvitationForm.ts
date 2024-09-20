import type { CSSResultArray, PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { getGravatarUrl } from '../../../utils/get-gravatar-url';
import { html, svg, css } from 'lit-element';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { asyncReplace } from 'lit-html/directives/async-replace';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';

const NS = 'user-invitation-form';
const Base = TranslatableMixin(InternalForm, NS);

export class UserInvitationForm extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      defaultDomain: { attribute: 'default-domain' },
      layout: {},
    };
  }

  static get styles(): CSSResultArray {
    return [
      ...super.styles,
      css`
        .inner-curve {
          --r: var(--lumo-border-radius-l); /* control the rounded part */
          --s: 3rem; /* control the size of the cut */
          --a: 12deg; /* control the depth of the curvature */
          --m: 0 / calc(2 * var(--r)) var(--r) no-repeat
            radial-gradient(50% 100% at bottom, #000 calc(100% - 1px), #0000);
          --d: (var(--s) + var(--r)) * cos(var(--a));

          border-radius: var(--r);
          width: 100%;
          mask: calc(50% + var(--d)) var(--m), calc(50% - var(--d)) var(--m),
            radial-gradient(
                var(--s) at 50% calc(-1 * sin(var(--a)) * var(--s)),
                #0000 100%,
                #000 calc(100% + 1px)
              )
              0 calc(var(--r) * (1 - sin(var(--a)))) no-repeat,
            linear-gradient(90deg, #000 calc(50% - var(--d)), #0000 0 calc(50% + var(--d)), #000 0);
        }
      `,
    ];
  }

  static get v8n(): NucleonV8N<Data> {
    return [({ email: v }) => !!v || 'email:v8n_required'];
  }

  /** Default host domain for stores that don't use a custom domain name, e.g. `foxycart.com`. */
  defaultDomain: string | null = null;

  /** Admin layout will display user info, user layout (default) will display store info. */
  layout: 'admin' | 'user' | null = null;

  private readonly __storeDomainGetValue = () => {
    const defaultD = this.defaultDomain;
    const domain = this.data?.store_domain;
    return domain?.includes('.') || !defaultD ? domain : `${domain}.${defaultD}`;
  };

  get readonlySelector(): BooleanSelector {
    const alwaysMatch = ['store', super.readonlySelector.toString()];
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['timestamps', 'submit', 'undo', super.hiddenSelector.toString()];
    const status = this.data?.status;

    if (status !== 'accepted' && status !== 'sent') alwaysMatch.unshift('revoke');
    if (status !== 'rejected') alwaysMatch.unshift('delete');
    if (status !== 'accepted') alwaysMatch.unshift('leave');
    if (status !== 'revoked') alwaysMatch.unshift('invite-again');
    if (status !== 'sent') alwaysMatch.unshift('resend', 'accept', 'reject');

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    const { layout, data } = this;

    if (layout === 'admin') {
      return data ? this.__renderAdminSnapshotState(data) : this.__renderAdminTemplateState();
    } else {
      return data ? this.__renderUserSnapshotState(data) : this.__renderUserTemplateState();
    }
  }

  protected async _fetch<TResult = Data>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    try {
      return await super._fetch(...args);
    } catch (err) {
      let message;

      try {
        message = (await (err as Response).json())._embedded['fx:errors'][0].message;
      } catch {
        throw err;
      }

      if (message.includes('already been created for this email and store')) {
        throw ['error:invitation_exists'];
      } else if (message.includes('already has access to this store')) {
        throw ['error:already_has_access'];
      } else {
        throw err;
      }
    }
  }

  private async *__getGravatar(email?: string) {
    yield html`
      <div
        style="height: 5rem; width: 5rem; left: calc(50% - 2.5rem); top: -2.8rem"
        class="rounded-full absolute top-0 bg-contrast-5"
      ></div>
    `;

    if (email) {
      yield html`
        <img
          data-testid="gravatar"
          style="height: 5rem; width: 5rem; left: calc(50% - 2.5rem); top: -2.8rem"
          class="rounded-full absolute top-0 bg-contrast-5 shadow-xs"
          src=${await getGravatarUrl(email)}
          alt=""
        />
      `;
    }
  }

  private __renderAdminTemplateState() {
    return html`
      ${this.renderHeader()}
      <foxy-internal-text-control infer="email"></foxy-internal-text-control>
      ${super.renderBody()}
    `;
  }

  private __renderUserTemplateState() {
    return html`
      <div class="p-xl flex items-center justify-center">
        <foxy-spinner layout="vertical" infer="unavailable" state="empty"></foxy-spinner>
      </div>
    `;
  }

  private __renderAdminSnapshotState({ first_name, last_name }: Data) {
    const hasName = first_name?.trim() || last_name?.trim();
    const nameOptions = { first_name, last_name, context: hasName ? '' : 'empty' };
    const hidden = this.hiddenSelector;

    return html`
      <div style="padding-top: 3.5rem">
        <div class="relative">
          <div class="inner-curve bg-contrast-5 absolute inset-0"></div>
          ${asyncReplace(this.__getGravatar(this.data?.email))}

          <div
            class="relative pb-m px-m leading-xs grid gap-m"
            style="padding-top: calc(2.5rem + var(--lumo-space-m))"
          >
            <div>
              <foxy-i18n
                class="block text-xl font-medium text-center"
                infer=""
                key="full_name"
                .options=${nameOptions}
              >
              </foxy-i18n>
              <div class="text-m text-center text-secondary">${this.data?.email}</div>
            </div>

            <div
              style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)"
              class=${classMap({
                'border rounded': true,
                'border-contrast text-contrast': this.data?.status === 'revoked',
                'border-success text-success': this.data?.status === 'accepted',
                'border-primary text-primary': this.data?.status === 'sent',
                'border-error text-error': this.data?.status === 'rejected',
              })}
            >
              <p class="font-medium flex items-center gap-s">
                ${this.data?.status === 'revoked'
                  ? svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1.25em; height: 1.25em"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm3 10.5a.75.75 0 0 0 0-1.5H9a.75.75 0 0 0 0 1.5h6Z" clip-rule="evenodd" /></svg>`
                  : this.data?.status === 'sent'
                  ? svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1.25em; height: 1.25em"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z" clip-rule="evenodd" /></svg>`
                  : this.data?.status === 'rejected'
                  ? svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1.25em; height: 1.25em"><path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clip-rule="evenodd" /></svg>`
                  : this.data?.status === 'accepted'
                  ? svg`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style="width: 1.25em; height: 1.25em"><path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clip-rule="evenodd" /></svg>`
                  : ''}
                <foxy-i18n
                  infer=""
                  key="admin_status_title"
                  .options=${{ context: this.data?.status }}
                >
                </foxy-i18n>
              </p>

              <p
                class="text-body"
                style="padding-left: calc((1.25 * var(--lumo-font-size-m)) + var(--lumo-space-s))"
              >
                <foxy-i18n
                  infer=""
                  key="admin_status_text"
                  .options=${{ context: this.data?.status }}
                >
                </foxy-i18n>
              </p>
            </div>

            <foxy-internal-user-invitation-form-sync-action status="sent" infer="invite-again">
            </foxy-internal-user-invitation-form-sync-action>

            <div
              class="flex gap-m"
              ?hidden=${hidden.matches('revoke', true) && hidden.matches('resend', true)}
            >
              <foxy-internal-user-invitation-form-sync-action
                status="revoked"
                class="flex-1"
                theme="error"
                infer="revoke"
              >
              </foxy-internal-user-invitation-form-sync-action>

              <foxy-internal-user-invitation-form-async-action
                infer="resend"
                class="flex-1"
                href=${ifDefined(this.data?._links['fx:resend'].href)}
              >
              </foxy-internal-user-invitation-form-async-action>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private __renderUserSnapshotState({ status, store_name }: Data) {
    const hidden = this.hiddenSelector;
    const textColorMap = {
      'text-primary': status === 'sent',
      'text-success': status === 'accepted',
      'text-error': status === 'rejected',
      'text-body': status === 'revoked',
    };

    return html`
      <div class=${classMap({ 'flex items-center gap-m': true, ...textColorMap })}>
        <div class="border-t flex-1"></div>
        ${svg`<svg style="height: 5rem; width: 5rem" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 256 256"><path fill="currentColor" fill-rule="evenodd" d="M128 250c67.38 0 122-54.62 122-122S195.38 6 128 6 6 60.62 6 128s54.62 122 122 122Zm0 6c70.7 0 128-57.3 128-128S198.7 0 128 0 0 57.3 0 128s57.3 128 128 128Z" clip-rule="evenodd"/><path fill="currentColor" fill-rule="evenodd" d="M128.5 218a89.5 89.5 0 1 0 0-179 89.5 89.5 0 0 0 0 179Zm23.8-46.25-5.13-3.08-54.48-32.91a3.6 3.6 0 0 1-1.69-3.12V78l5.07 3.02c1.06.6 1.78 1.8 1.78 3.15v46.4l52.75 31.87a3.63 3.63 0 0 1 1.72 3.17l-.01 6.14ZM166 180l-5.17-3.11a3.62 3.62 0 0 1-1.7-3.1v-46.47l-47.64-28.8v25.92l-.02 6.14-5.09-3.09a3.5 3.5 0 0 1-1.71-3.05V92.38a3.6 3.6 0 0 1 1.71-3.09 3.3 3.3 0 0 1 3.44.01l54.47 32.9a3.62 3.62 0 0 1 1.7 3.11v48.47L166 180Zm-46.1-44.34c.53.34 5.2 3.17 5.2 3.17s.04-4.24.04-6.22v-15.57c0-1.32-.68-2.48-1.7-3.1-.5-.31-5.14-3.06-5.14-3.06v21.73c0 1.29.64 2.41 1.6 3.05Zm18.86 11.42-5.17-3.14a3.62 3.62 0 0 1-1.66-3.08v-21.77l5.1 3.07a3.62 3.62 0 0 1 1.75 3.13v15.57l-.02 6.22Zm8.46 5.1 5.15 3.12v-21.78a3.6 3.6 0 0 0-1.8-3.16c-.48-.28-5.06-3.08-5.06-3.08v21.8c0 1.33.7 2.48 1.71 3.1Z" clip-rule="evenodd"/><path fill="currentColor" d="M132.57 222a2.96 2.96 0 0 1 2.96 2.96v15.86a3 3 0 0 1-3 3h-9.95a2.39 2.39 0 1 1 0-4.78h5.15a1.88 1.88 0 0 0 0-3.75h-4.22a2.39 2.39 0 1 1 0-4.77h3.1a3 3 0 0 0 3-3v-2.56a2.96 2.96 0 0 1 2.96-2.96Zm-37.07 6.3c.5-2.37 1.39-4.28 2.66-5.71a9.51 9.51 0 0 1 4.52-2.9c1.75-.5 3.59-.55 5.52-.14a11.1 11.1 0 0 1 5 2.38 9.6 9.6 0 0 1 2.95 4.5c.57 1.83.6 3.93.1 6.29a12.33 12.33 0 0 1-2.65 5.7 9.44 9.44 0 0 1-4.52 2.91c-1.75.51-3.6.56-5.54.14a11.2 11.2 0 0 1-4.98-2.37 9.42 9.42 0 0 1-2.96-4.5 12.25 12.25 0 0 1-.1-6.3Zm5.95 1.27a9.13 9.13 0 0 0-.17 3.34c.14.95.5 1.73 1.06 2.32.56.6 1.31 1 2.27 1.2.96.2 1.82.15 2.58-.17a4.27 4.27 0 0 0 1.91-1.69 9.2 9.2 0 0 0 1.19-3.12c.27-1.28.33-2.4.19-3.35a4.33 4.33 0 0 0-1.07-2.31 4.28 4.28 0 0 0-2.28-1.2 4.24 4.24 0 0 0-2.56.17c-.76.31-1.4.88-1.92 1.68a9.23 9.23 0 0 0-1.2 3.13Zm-15.5 6.41a2.84 2.84 0 0 1-1.67-2.33l-.52-5.52c0-.05-.04-.1-.09-.12a.14.14 0 0 0-.15.02l-4.5 3.3a2.82 2.82 0 1 1-3.29-4.57l4.84-3.4a3 3 0 0 0 1.24-2.87l-.8-5.83a2.85 2.85 0 1 1 5.65-.68l.58 5.7c0 .05.04.1.09.12.05.02.1.01.14-.02l4.63-3.38a2.85 2.85 0 1 1 3.29 4.64l-4.87 3.34a3 3 0 0 0-1.28 2.83l.69 5.84a2.84 2.84 0 0 1-3.98 2.93Zm-16.33-12.59a2.87 2.87 0 1 1-5.67-.91l1.42-7.81a.14.14 0 0 0-.2-.15l-6.99 3.77a2.87 2.87 0 1 1-2.61-5.11l10.27-4.98a3 3 0 0 0 1.12-.94l1.86-2.56a2.94 2.94 0 1 1 4.76 3.46l-1.86 2.56a3 3 0 0 0-.55 1.36l-1.55 11.3Zm-11.39-33.1a2.93 2.93 0 0 1-.22 4.21c-.6.55-1.3.8-2.12.75a2.93 2.93 0 0 1-2.06-1 2.89 2.89 0 0 1-.74-2.11 2.8 2.8 0 0 1 2.35-2.76 3.2 3.2 0 0 1 1.52.09c.5.16.92.43 1.27.82ZM34.2 187.3a2.39 2.39 0 1 1-4.14 2.39l-4.37-7.57a2.39 2.39 0 1 1 4.13-2.38l4.37 7.56Zm14.75-8.52a2.39 2.39 0 0 1-4.13 2.38l-4.37-7.56a2.39 2.39 0 1 1 4.13-2.39l4.37 7.57Zm-21.08 7.13a2.96 2.96 0 0 1 1.09-4.05l13.76-7.95a2.96 2.96 0 0 1 2.96 5.13L31.92 187a2.96 2.96 0 0 1-4.05-1.09Zm-2.9-36.06c2.3-.75 4.4-.94 6.28-.56a9.51 9.51 0 0 1 4.78 2.47 11.27 11.27 0 0 1 2.88 4.71c.61 1.9.76 3.74.44 5.53a9.6 9.6 0 0 1-2.43 4.8c-1.3 1.4-3.1 2.48-5.4 3.23-2.3.75-4.4.94-6.26.56a9.44 9.44 0 0 1-4.78-2.46 11.24 11.24 0 0 1-2.9-4.73 11.2 11.2 0 0 1-.43-5.5 9.42 9.42 0 0 1 2.42-4.81 12.26 12.26 0 0 1 5.4-3.24Zm1.88 5.8c-1.24.4-2.23.9-2.98 1.5a4.2 4.2 0 0 0-1.47 2.09 4.2 4.2 0 0 0 .1 2.57c.3.93.77 1.64 1.43 2.14.64.5 1.45.77 2.41.82.96.05 2.06-.13 3.3-.54 1.25-.4 2.24-.9 3-1.5a4.34 4.34 0 0 0 1.47-2.09 4.3 4.3 0 0 0-.1-2.57 4.24 4.24 0 0 0-1.43-2.14 4.24 4.24 0 0 0-2.42-.82 9.24 9.24 0 0 0-3.3.53Zm3.91-38.41a4.55 4.55 0 0 1-.87 2.28 4.9 4.9 0 0 1-1.87 1.52c-.75.34-1.55.46-2.4.37a4.52 4.52 0 0 1-2.28-.87 4.81 4.81 0 0 1-1.9-4.28 4.72 4.72 0 0 1 5.15-4.17 4.8 4.8 0 0 1 3.8 2.74c.34.75.46 1.55.37 2.41ZM44.58 84.8a2.96 2.96 0 0 1-4.05 1.09L26.8 77.96a3 3 0 0 1-1.1-4.1l4.98-8.62a2.39 2.39 0 1 1 4.13 2.39l-2.58 4.46a1.88 1.88 0 0 0 3.25 1.88l2.1-3.66a2.39 2.39 0 1 1 4.14 2.39l-1.54 2.68a3 3 0 0 0 1.1 4.1l2.21 1.28a2.96 2.96 0 0 1 1.09 4.04Zm13.07-35.26a12.31 12.31 0 0 1 3.62 5.17c.6 1.81.69 3.6.25 5.37a11.27 11.27 0 0 1-2.64 4.85 11.24 11.24 0 0 1-4.56 3.14c-1.72.6-3.5.7-5.37.3a12.34 12.34 0 0 1-5.5-3.06 12.33 12.33 0 0 1-3.62-5.15 9.46 9.46 0 0 1-.25-5.36c.43-1.77 1.31-3.4 2.64-4.87a11.2 11.2 0 0 1 4.56-3.13 9.4 9.4 0 0 1 5.37-.31c1.86.4 3.7 1.43 5.5 3.05Zm-4.07 4.53a9.15 9.15 0 0 0-2.8-1.82 4.18 4.18 0 0 0-2.55-.24 4.2 4.2 0 0 0-2.17 1.37 4.24 4.24 0 0 0-1.14 2.31c-.1.8.06 1.64.5 2.5a9.33 9.33 0 0 0 2.11 2.6c.97.87 1.9 1.48 2.8 1.83.9.34 1.75.42 2.54.24a4.3 4.3 0 0 0 2.18-1.38 4.24 4.24 0 0 0 1.14-2.3c.1-.82-.06-1.65-.5-2.5a9.24 9.24 0 0 0-2.11-2.61Zm2.2-16.63c.83-.6 1.92-.7 2.85-.28l5.04 2.3a.15.15 0 0 0 .2-.15l-.6-5.55a2.82 2.82 0 1 1 5.6-.56l.53 5.89a3 3 0 0 0 1.86 2.5l5.45 2.23a2.85 2.85 0 1 1-2.24 5.24l-5.22-2.35a.15.15 0 0 0-.2.15l.61 5.7a2.85 2.85 0 1 1-5.66.52l-.46-5.88a3 3 0 0 0-1.8-2.52l-5.42-2.33a2.84 2.84 0 0 1-.54-4.9Zm19.07-7.84a2.87 2.87 0 1 1 3.62-4.47l6.06 5.14a.14.14 0 0 0 .22-.1l.23-7.93a2.87 2.87 0 1 1 5.74.29l-.83 11.38a3 3 0 0 0 .25 1.44l1.29 2.9a2.94 2.94 0 1 1-5.37 2.39l-1.3-2.9a3 3 0 0 0-.9-1.14l-9.01-7Zm34.35 6.68a2.93 2.93 0 0 1-3.53-2.3 2.78 2.78 0 0 1 .41-2.2 2.93 2.93 0 0 1 1.9-1.3 2.9 2.9 0 0 1 2.2.42 2.8 2.8 0 0 1 1.21 3.41c-.18.5-.46.93-.84 1.28-.38.35-.83.58-1.34.7Zm14.61-19.33a2.39 2.39 0 0 1 0-4.77h8.74a2.39 2.39 0 0 1 0 4.77h-8.74Zm0 17.05a2.39 2.39 0 0 1 0-4.77h8.74a2.39 2.39 0 0 1 0 4.77h-8.74Zm4.37-21.82a2.96 2.96 0 0 1 2.97 2.96v15.9a2.96 2.96 0 0 1-5.93 0v-15.9a2.96 2.96 0 0 1 2.96-2.96Zm32.68 15.52a12.24 12.24 0 0 1-2.66 5.71 9.5 9.5 0 0 1-4.53 2.9c-1.74.5-3.58.55-5.52.14a11.24 11.24 0 0 1-5-2.38 9.6 9.6 0 0 1-2.94-4.5 12.4 12.4 0 0 1-.1-6.29c.5-2.37 1.38-4.28 2.65-5.7a9.44 9.44 0 0 1 4.51-2.91c1.75-.51 3.6-.56 5.54-.14 1.94.4 3.6 1.2 4.99 2.37a9.42 9.42 0 0 1 2.95 4.5c.58 1.82.62 3.92.11 6.3Zm-5.96-1.27c.27-1.28.33-2.4.18-3.34a4.18 4.18 0 0 0-1.07-2.32 4.2 4.2 0 0 0-2.27-1.2 4.24 4.24 0 0 0-2.57.17c-.75.31-1.39.88-1.92 1.69a9.2 9.2 0 0 0-1.18 3.12 9.4 9.4 0 0 0-.2 3.35 4.4 4.4 0 0 0 1.07 2.31c.57.6 1.33 1 2.29 1.2.96.2 1.8.15 2.56-.17.75-.31 1.4-.88 1.91-1.68.53-.81.93-1.85 1.2-3.13Zm31.3 22.59a4.54 4.54 0 0 1-1.53-1.9 4.9 4.9 0 0 1-.38-2.38 4.5 4.5 0 0 1 .88-2.27c.5-.7 1.14-1.21 1.89-1.54a4.81 4.81 0 0 1 4.65.5 4.72 4.72 0 0 1 1.04 6.55 4.8 4.8 0 0 1-4.27 1.91 4.51 4.51 0 0 1-2.28-.87Zm21.19 28.18a2.96 2.96 0 0 1 1.08-4.05l13.73-7.93a3 3 0 0 1 4.1 1.1l4.98 8.62a2.39 2.39 0 0 1-4.13 2.39l-2.58-4.47a1.87 1.87 0 1 0-3.25 1.88l2.11 3.65a2.39 2.39 0 1 1-4.13 2.39l-1.55-2.68a3 3 0 0 0-4.1-1.1l-2.22 1.28a2.96 2.96 0 0 1-4.04-1.08Zm24 28.95c-2.31.75-4.4.94-6.29.56a9.5 9.5 0 0 1-4.78-2.47 11.26 11.26 0 0 1-2.87-4.71c-.61-1.9-.76-3.74-.44-5.53a9.6 9.6 0 0 1 2.43-4.8 12.5 12.5 0 0 1 5.39-3.23c2.31-.75 4.4-.94 6.27-.56a9.44 9.44 0 0 1 4.78 2.46 11.23 11.23 0 0 1 2.89 4.73c.6 1.88.75 3.71.43 5.5a9.43 9.43 0 0 1-2.41 4.81 12.26 12.26 0 0 1-5.4 3.24Zm-1.89-5.8c1.25-.4 2.24-.9 2.98-1.5a4.17 4.17 0 0 0 1.48-2.09 4.2 4.2 0 0 0-.1-2.57 4.25 4.25 0 0 0-1.43-2.14 4.27 4.27 0 0 0-2.42-.82 9.32 9.32 0 0 0-3.3.54c-1.24.4-2.24.9-2.99 1.5a4.34 4.34 0 0 0-1.47 2.09 4.3 4.3 0 0 0 .1 2.57c.3.93.78 1.65 1.43 2.14.65.5 1.46.77 2.41.82.97.05 2.07-.13 3.31-.53Zm13.3 10.23a2.84 2.84 0 0 1-1.18 2.61l-4.52 3.21a.15.15 0 0 0-.06.14c.01.05.04.1.1.12l5.1 2.24a2.82 2.82 0 1 1-2.31 5.14l-5.37-2.48a3 3 0 0 0-3.1.35l-4.65 3.61a2.85 2.85 0 1 1-3.41-4.56l4.64-3.35a.15.15 0 0 0 .06-.13c0-.06-.04-.1-.08-.12l-5.25-2.31a2.84 2.84 0 1 1 2.38-5.17l5.32 2.54a3 3 0 0 0 3.1-.3l4.71-3.52a2.84 2.84 0 0 1 4.52 1.98Zm-2.74 20.44a2.87 2.87 0 1 1 2.06 5.36l-7.48 2.68a.13.13 0 0 0-.1.11c0 .06.03.1.07.13l6.76 4.17a2.87 2.87 0 1 1-3.12 4.83l-9.45-6.42a3 3 0 0 0-1.37-.5l-3.15-.33a2.94 2.94 0 0 1 .62-5.85l3.14.33a3 3 0 0 0 1.45-.2l10.57-4.31Zm-22.96 26.41a2.93 2.93 0 0 1 3.75-1.92 2.8 2.8 0 0 1 1.71 1.47c.37.74.42 1.5.17 2.28-.24.74-.73 1.3-1.46 1.7a2.8 2.8 0 0 1-3.56-.66c-.34-.4-.57-.85-.7-1.36-.1-.5-.08-1.01.09-1.51Zm9.43 22.32a2.39 2.39 0 1 1 4.13 2.38l-4.37 7.57a2.39 2.39 0 1 1-4.13-2.39l4.37-7.56Zm-14.77-8.53a2.39 2.39 0 1 1 4.14 2.39l-4.37 7.56a2.39 2.39 0 0 1-4.13-2.38l4.36-7.57Zm16.72 14.7a2.96 2.96 0 0 1-4.05 1.08l-13.76-7.95a2.96 2.96 0 1 1 2.96-5.13l13.76 7.95a2.96 2.96 0 0 1 1.09 4.04Zm-29.78 20.54a12.3 12.3 0 0 1-3.62-5.17 9.5 9.5 0 0 1-.25-5.37 11.27 11.27 0 0 1 2.64-4.85 11.25 11.25 0 0 1 4.57-3.14 9.6 9.6 0 0 1 5.37-.3c1.87.43 3.7 1.44 5.5 3.06a12.33 12.33 0 0 1 3.61 5.15c.61 1.82.7 3.6.26 5.36a11.24 11.24 0 0 1-2.65 4.87 11.2 11.2 0 0 1-4.55 3.13 9.4 9.4 0 0 1-5.37.31 12.26 12.26 0 0 1-5.5-3.05Zm4.08-4.53c.97.88 1.9 1.48 2.8 1.82.9.35 1.75.43 2.54.24a4.2 4.2 0 0 0 2.18-1.37 4.24 4.24 0 0 0 1.14-2.31c.1-.8-.07-1.64-.5-2.5a9.33 9.33 0 0 0-2.12-2.6 9.4 9.4 0 0 0-2.8-1.83 4.34 4.34 0 0 0-2.54-.24c-.8.2-1.52.66-2.17 1.39a4.24 4.24 0 0 0-1.14 2.3c-.1.81.06 1.64.5 2.5a9.21 9.21 0 0 0 2.11 2.6Zm-35.21 15.81a4.54 4.54 0 0 1 2.4-.38c.83.1 1.58.39 2.25.86a4.55 4.55 0 0 1 1.54 1.9c.35.79.48 1.6.38 2.4a4.81 4.81 0 0 1-2.76 3.79 4.73 4.73 0 0 1-6.19-2.38 4.81 4.81 0 0 1 .48-4.66 4.51 4.51 0 0 1 1.9-1.53Z"/></svg>`}
        <div class="border-t flex-1"></div>
      </div>

      <foxy-i18n
        infer=""
        class=${classMap({ 'block text-center text-xl font-medium': true, ...textColorMap })}
        key="user_status_title"
        .options=${{ context: status, store_name }}
      >
      </foxy-i18n>

      <foxy-internal-summary-control infer="store">
        <foxy-internal-text-control
          layout="summary-item"
          infer="store-domain"
          .getValue=${this.__storeDomainGetValue}
        >
        </foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="store-url">
        </foxy-internal-text-control>
        <foxy-internal-text-control layout="summary-item" infer="store-email">
        </foxy-internal-text-control>
      </foxy-internal-summary-control>

      <foxy-i18n
        class="block text-secondary text-center"
        infer=""
        key="user_status_text"
        .options=${{ context: status, store_name }}
      >
      </foxy-i18n>

      <foxy-internal-user-invitation-form-sync-action
        status="revoked"
        theme="error"
        class="flex-1"
        infer="leave"
      >
      </foxy-internal-user-invitation-form-sync-action>

      <div
        class="grid grid-cols-2 gap-m"
        ?hidden=${hidden.matches('reject', true) && hidden.matches('accept', true)}
      >
        <foxy-internal-user-invitation-form-sync-action
          status="rejected"
          theme="error primary"
          infer="reject"
        >
        </foxy-internal-user-invitation-form-sync-action>

        <foxy-internal-user-invitation-form-sync-action
          status="accepted"
          theme="success primary"
          infer="accept"
        >
        </foxy-internal-user-invitation-form-sync-action>
      </div>

      <foxy-internal-delete-control infer="delete"></foxy-internal-delete-control>
    `;
  }
}
