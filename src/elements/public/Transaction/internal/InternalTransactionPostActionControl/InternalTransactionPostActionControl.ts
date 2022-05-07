import { PropertyDeclarations, html, TemplateResult } from 'lit-element';
import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';

export class InternalTransactionPostActionControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      theme: { type: String },
      state: { type: String },
      href: { type: String },
      icon: { type: String },
    };
  }

  theme = '';

  state = 'idle';

  href = '';

  icon = '';

  renderControl(): TemplateResult {
    const state = this.state;
    const theme = state === 'fail' ? 'error' : state === 'idle' ? this.theme : '';

    return html`
      <vaadin-button
        class="w-full"
        theme="${theme} tertiary"
        ?disabled=${state === 'busy' || this.disabled}
        @click=${this.submit}
      >
        <foxy-i18n key=${state} infer></foxy-i18n>
      </vaadin-button>
    `;
  }

  async submit(): Promise<void> {
    if (this.state === 'busy') return;

    try {
      this.state = 'busy';
      const response = await new NucleonElement.API(this).fetch(this.href, { method: 'POST' });
      this.state = response.ok ? 'idle' : 'fail';
      if (response.ok) this.dispatchEvent(new CustomEvent('done'));
    } catch {
      this.state = 'fail';
    }
  }
}
