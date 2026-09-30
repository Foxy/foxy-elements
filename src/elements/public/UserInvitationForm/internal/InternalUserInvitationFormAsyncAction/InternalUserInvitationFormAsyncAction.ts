import type { PropertyDeclarations, TemplateResult } from 'lit-element';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-element';

export class InternalUserInvitationFormAsyncAction extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __state: { type: String },
      theme: { type: String },
      href: { type: String },
    };
  }

  theme: string | null = null;

  href: string | null = null;

  private __state = 'idle';

  renderControl(): TemplateResult {
    const state = this.__state;
    const theme = state === 'fail' ? 'error' : state === 'idle' ? this.theme : '';

    return html`
      <vaadin-button
        theme=${ifDefined(theme ?? void 0)}
        class="w-full"
        ?disabled=${state === 'busy' || this.disabled}
        @click=${this.__submit}
      >
        <foxy-i18n key=${state} infer=""></foxy-i18n>
      </vaadin-button>
    `;
  }

  private async __submit(): Promise<void> {
    if (this.__state === 'busy') return;

    try {
      this.__state = 'busy';

      const api = new NucleonElement.API(this);
      const response = await api.fetch(this.href ?? '', { method: 'POST' });

      if (response.ok) {
        await this.__share(api);
        this.__state = 'idle';
      } else {
        this.__state = 'fail';
      }
    } catch {
      this.__state = 'fail';
    }
  }

  // Shares the updated invitation with the Rumour group, like NucleonElement#_sendDelete
  // does, so that collections listing it (parent and related) reload.
  private async __share(api: InstanceType<typeof NucleonElement.API>): Promise<void> {
    const nucleon = this.nucleon;
    if (!nucleon?.href) return;

    try {
      const headers = { 'cache-control': 'no-cache' };
      const response = await api.fetch(nucleon.href, { headers });
      if (!response.ok) return;

      const data = await response.json();
      const related = [...nucleon.related, nucleon.parent].filter(Boolean);
      NucleonElement.Rumour(nucleon.group).share({ related, source: nucleon.href, data });
    } catch {
      // The action itself succeeded, so a failed re-fetch is not an error here.
    }
  }
}
