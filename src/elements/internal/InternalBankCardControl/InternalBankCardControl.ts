import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { InternalControl } from '../InternalControl/InternalControl';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

export class InternalBankCardControl extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __isUiReady: { attribute: false },
      property: { type: String, noAccessor: true },
    };
  }

  private readonly __handleMessage = (evt: MessageEvent) => {
    const data = JSON.parse(evt.data);

    if (data.type === 'resize') {
      const iframe = this.__iframe;
      if (iframe) iframe.style.height = data.height;
    } else if (data.type === 'token') {
      this.nucleon?.edit({ [this.property]: data.token });
    }
  };

  private __refreshInterval: NodeJS.Timeout | null = null;

  private __isUiReady = false;

  private __property: string | null = null;

  private __channel: MessageChannel | null = null;

  get property(): string {
    if (typeof this.__property === 'string') return this.__property;
    if (typeof this.infer === 'string') return this.infer.replace(/-/g, '_');
    return '';
  }

  set property(newValue: string) {
    this.requestUpdate('property', this.__property);
    this.__property = newValue;
  }

  reportValidity(): void {
    this.__sendMessage({ type: 'report_validity' });
  }

  resetProperty(): void {
    this.requestUpdate('property', this.__property);
    this.__property = null;
  }

  renderControl(): TemplateResult {
    return html`
      <div class="relative">
        <iframe
          class=${classMap({ 'transition-all relative': true, 'opacity-0': !this.__isUiReady })}
          style="width: calc(100% + 4px); margin: -2px"
          src=${ifDefined(this.__iframeSrc)}
          @load=${() => {
            this.__channel?.port1.close();
            this.__channel?.port1.removeEventListener('message', this.__handleMessage);
            this.__channel = new MessageChannel();
            this.__channel.port1.addEventListener('message', this.__handleMessage);
            this.__channel.port1.start();
            this.__iframe?.contentWindow?.postMessage('connect', '*', [this.__channel.port2]);
            this.__isUiReady = true;
          }}
        >
        </iframe>

        <div
          class=${classMap({
            'absolute inset-0 flex items-center justify-center': true,
            'transition-opacity pointer-events-none': true,
            'opacity-0': this.__isUiReady,
          })}
        >
          <foxy-spinner infer="spinner" layout="no-label"></foxy-spinner>
        </div>
      </div>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (!this.__iframe && this.__isUiReady) this.__isUiReady = false;
    this.__sendMessage(this.__createConfig());
    this.__configure();
  }

  private get __iframeSrc() {
    return this.nucleon?.data?._links['fx:cc_token_embed_url'].href;
  }

  private get __iframe() {
    return this.renderRoot.querySelector('iframe');
  }

  private __createConfig() {
    const i18nKeys = [
      'cc-number.v8n_unsupported',
      'cc-number.v8n_required',
      'cc-number.v8n_invalid',
      'cc-number.placeholder',
      'cc-number.label',
      'cc-exp.v8n_required',
      'cc-exp.v8n_invalid',
      'cc-exp.v8n_expired',
      'cc-exp.placeholder',
      'cc-exp.label',
      'cc-csc.v8n_required',
      'cc-csc.v8n_invalid',
      'cc-csc.placeholder',
      'cc-csc.label',
      'supported-cards.label',
      'status-message.idle',
      'status-message.busy',
      'status-message.fail_4xx',
      'status-message.fail_5xx',
    ];

    const cssVars = [
      '--lumo-space-m',
      '--lumo-space-s',
      '--lumo-contrast-5pct',
      '--lumo-contrast-10pct',
      '--lumo-contrast-50pct',
      '--lumo-size-m',
      '--lumo-size-xs',
      '--lumo-border-radius-m',
      '--lumo-border-radius-s',
      '--lumo-font-family',
      '--lumo-font-size-m',
      '--lumo-font-size-s',
      '--lumo-font-size-xs',
      '--lumo-primary-color',
      '--lumo-primary-text-color',
      '--lumo-primary-color-50pct',
      '--lumo-secondary-text-color',
      '--lumo-disabled-text-color',
      '--lumo-body-text-color',
      '--lumo-error-text-color',
      '--lumo-error-color-10pct',
      '--lumo-error-color-50pct',
      '--lumo-line-height-xs',
      '--lumo-base-color',
    ];

    const rootComputedStyle = getComputedStyle(document.documentElement);
    const computedStyle = getComputedStyle(this);
    const style: Record<string, string> = {};

    style.fontSize = rootComputedStyle.fontSize;
    cssVars.forEach(key => (style[key] = computedStyle.getPropertyValue(key)));

    return {
      translations: i18nKeys.reduce<Record<string, string>>((p, c) => {
        p[c] = this.t(c);
        return p;
      }, {}),

      disabled: this.disabled,
      readonly: this.readonly,
      style: style,
      type: 'config',
    };
  }

  private __sendMessage(data: unknown) {
    this.__channel?.port1.postMessage(JSON.stringify(data));
  }

  private __configure() {
    if (this.__refreshInterval) clearInterval(this.__refreshInterval);
    if (this.isConnected) {
      const callback = () => this.__sendMessage(this.__createConfig());
      this.__refreshInterval = setInterval(callback, 1000);
    }
  }
}
