import { PropertyDeclarations, TemplateResult, html, svg } from 'lit-element';

import { BooleanSelector } from '@foxy.io/sdk/core';
import { Dialog } from '../../private/Dialog/Dialog';
import { API } from '../../public/NucleonElement/API';

export class InternalPostActionControlDialog extends Dialog {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      messageOptions: { type: Object, attribute: 'message-options' },
      href: {},
      __state: { attribute: false },
    };
  }

  messageOptions: Record<string, string> = {};

  closable = true;

  header = 'header';

  alert = true;

  href: string | null = null;

  private readonly __api = new API(this);

  private __state: 'idle' | 'busy' | 'done' | 'fail' = 'idle';

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['close-button', super.hiddenSelector.toString()];
    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  render(): TemplateResult {
    return super.render(
      () => html`
        <div class="relative">
          <div class="mb-m mt-xs flex justify-center">
            ${this.__state === 'done'
              ? svg`<svg class="text-success" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 2rem; height: 2rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`
              : this.__state === 'fail'
              ? svg`<svg class="text-error" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 2rem; height: 2rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>`
              : svg`<svg class="text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 2rem; height: 2rem;"><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" /></svg>`}
          </div>

          <foxy-i18n
            class="block font-lumo text-m text-body text-center mb-l"
            infer=""
            key="message_${this.__state === 'busy' ? 'idle' : this.__state}"
            .options=${this.messageOptions}
          >
          </foxy-i18n>

          <div class="grid grid-cols-2 gap-m">
            ${this.__state === 'done' || this.__state === 'fail'
              ? html`
                  <vaadin-button class="col-span-2" theme="contrast" @click=${() => this.hide()}>
                    <foxy-i18n infer="" key="button_close"></foxy-i18n>
                  </vaadin-button>
                `
              : html`
                  <vaadin-button
                    ?disabled=${this.disabled || this.readonly}
                    @click=${() => this.hide()}
                  >
                    <foxy-i18n infer="" key="button_cancel"></foxy-i18n>
                  </vaadin-button>

                  <vaadin-button
                    theme="primary"
                    ?disabled=${this.disabled || this.readonly}
                    @click=${async () => {
                      if (this.href && this.__state === 'idle') {
                        this.__state = 'busy';
                        this.closable = false;
                        const response = await this.__api.fetch(this.href, { method: 'POST' });
                        this.__state = response.ok ? 'done' : 'fail';
                        this.closable = true;
                      }
                    }}
                  >
                    <foxy-i18n infer="" key="button_confirm"></foxy-i18n>
                  </vaadin-button>
                `}
          </div>

          ${this.__state === 'busy'
            ? html`
                <div class="bg-base absolute inset-0 flex items-center justify-center">
                  <foxy-spinner layout="vertical" infer=""></foxy-spinner>
                </div>
              `
            : ''}
        </div>
      `
    );
  }

  async hide(): Promise<void> {
    await super.hide(this.__state !== 'done');
    this.__state = 'idle';
  }
}
