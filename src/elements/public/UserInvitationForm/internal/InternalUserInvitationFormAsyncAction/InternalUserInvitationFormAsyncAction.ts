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

      this.__state = response.ok ? 'idle' : 'fail';
      if (response.ok) this.dispatchEvent(new CustomEvent('done'));
    } catch {
      this.__state = 'fail';
    }
  }
}
