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
    } else if (data.type === 'ready') {
      this.__isUiReady = true;
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

        <div
          class="hidden ml-m mr-s bg-contrast-5 text-contrast-10 h-m w-xs rounded-tr-m rounded-br-s font-lumo text-m leading-xs"
          style="border-top-color: var(--lumo-primary-color); border-bottom-color: var(--lumo-primary-text-color); border-left-color: var(--lumo-primary-color-50pct); border-right-color: var(--lumo-secondary-text-color);"
          id="d1"
        ></div>

        <div
          class="hidden text-s text-disabled"
          style="background-color: var(--lumo-body-text-color); border-top-color: var(--lumo-error-text-color); border-bottom-color: var(--lumo-error-color-10pct); border-left-color: var(--lumo-error-color-50pct);"
          id="d2"
        ></div>

        <div class="hidden border-top-contrast-50 text-xs bg-base" id="d3"></div>
      </div>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (!this.__iframe && this.__isUiReady) this.__isUiReady = false;
    const config = this.__createConfig();
    if (config) this.__sendMessage(config);
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
      'stripe-card.label',
      'square-card.label',
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
      'status-message.stripe_idle',
      'status-message.square_idle',
      'status-message.busy',
      'status-message.fail_4xx',
      'status-message.fail_5xx',
    ];

    const d1 = this.renderRoot.querySelector('#d1');
    const d2 = this.renderRoot.querySelector('#d2');
    const d3 = this.renderRoot.querySelector('#d3');

    if (!d1 || !d2 || !d3) return;

    const d1Style = getComputedStyle(d1);
    const d2Style = getComputedStyle(d2);
    const d3Style = getComputedStyle(d3);

    const style: Record<string, string> = {
      '--lumo-space-m': d1Style.marginLeft,
      '--lumo-space-s': d1Style.marginRight,
      '--lumo-contrast-5pct': d1Style.backgroundColor,
      '--lumo-contrast-10pct': d1Style.color,
      '--lumo-contrast-50pct': d3Style.borderTopColor,
      '--lumo-size-m': d1Style.height,
      '--lumo-size-xs': d1Style.width,
      '--lumo-border-radius-m': d1Style.borderTopRightRadius,
      '--lumo-border-radius-s': d1Style.borderBottomRightRadius,
      '--lumo-font-family': d1Style.fontFamily,
      '--lumo-font-size-m': d1Style.fontSize,
      '--lumo-font-size-s': d2Style.fontSize,
      '--lumo-font-size-xs': d3Style.fontSize,
      '--lumo-primary-color': d1Style.borderTopColor,
      '--lumo-primary-text-color': d1Style.borderBottomColor,
      '--lumo-primary-color-50pct': d1Style.borderLeftColor,
      '--lumo-secondary-text-color': d1Style.borderRightColor,
      '--lumo-disabled-text-color': d2Style.color,
      '--lumo-body-text-color': d2Style.backgroundColor,
      '--lumo-error-text-color': d2Style.borderTopColor,
      '--lumo-error-color-10pct': d2Style.borderBottomColor,
      '--lumo-error-color-50pct': d2Style.borderLeftColor,
      '--lumo-line-height-xs': d1Style.lineHeight,
      '--lumo-base-color': d3Style.backgroundColor,
    };

    return {
      translations: i18nKeys.reduce<Record<string, string>>((p, c) => {
        p[c] = this.t(c);
        return p;
      }, {}),

      disabled: this.disabled,
      readonly: this.readonly,
      style: style,
      lang: this.lang,
      type: 'config',
    };
  }

  private __sendMessage(data: unknown) {
    this.__channel?.port1.postMessage(JSON.stringify(data));
  }

  private __configure() {
    if (this.__refreshInterval) clearInterval(this.__refreshInterval);
    if (this.isConnected) {
      const callback = () => {
        const config = this.__createConfig();
        this.__sendMessage(config);
      };
      this.__refreshInterval = setInterval(callback, 1000);
    }
  }
}
