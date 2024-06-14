import type { PaymentCardEmbedConfig } from '@foxy.io/sdk/dist/types/customer/types';
import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { TranslatableMixin } from '../../../mixins/translatable';
import { ConfigurableMixin } from '../../../mixins/configurable';
import { LitElement, html } from 'lit-element';
import { PaymentCardEmbed } from '@foxy.io/sdk/customer';
import { InferrableMixin } from '../../../mixins/inferrable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { set } from 'lodash-es';

const NS = 'payment-card-embed';
const Base = ConfigurableMixin(TranslatableMixin(InferrableMixin(ThemeableMixin(LitElement)), NS));

/**
 * A secure, PCI-compliant element for collecting payment card information with
 * support for Stripe, Square and embedded gateways.
 *
 * @fires CustomEvent - Instance of `CustomEvent` with type `submit`. Dispatched when the user submits the form (not available for Stripe).
 *
 * @element foxy-payment-card-embed
 * @since 1.27.0
 */
export class PaymentCardEmbedElement extends Base {
  static readonly PaymentCardEmbed = PaymentCardEmbed;

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __ready: { attribute: false },
      url: {},
    };
  }

  /**
   * Full Bank Card Embed URL, e.g. `https://embed.foxy.io/v1.html?template_set_id=123`.
   *
   * The following demo URLs are available:
   * - `https://embed.foxy.io/v1.html?demo=default` (Default form)
   * - `https://embed.foxy.io/v1.html?demo=stripe` (Stripe Card Element)
   * - `https://embed.foxy.io/v1.html?demo=square` (Square Card Element)
   */
  url: string | null = null;

  private __configRefreshInterval: NodeJS.Timeout | null = null;

  private __embed: PaymentCardEmbed | null = null;

  private __ready = false;

  disconnectedCallback(): void {
    super.disconnectedCallback();
    clearInterval(this.__configRefreshInterval ?? undefined);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.__configRefreshInterval = setInterval(() => {
      const config = this.__config;
      if (config) this.__embed?.configure(config);
    }, 1000);
  }

  /** Tokenizes payment card info. Resolves with a token on success or rejects otherwise. */
  tokenize(): Promise<string> {
    return this.__embed?.tokenize() ?? Promise.reject();
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);
    if (changes.has('hidden') || changes.has('url')) this.__setupEmbed();
  }

  render(): TemplateResult {
    return html`
      <div class="relative">
        <div
          class=${classMap({ 'transition-opacity relative': true, 'opacity-0': !this.__ready })}
          id="iframe-container"
        ></div>

        <div
          class=${classMap({
            'absolute inset-0 flex items-center justify-center': true,
            'transition-opacity pointer-events-none': true,
            'opacity-0': this.__ready,
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

        <div class="hidden text-contrast-50 text-xs bg-base" id="d3"></div>
      </div>
    `;
  }

  /** Clears form fields. */
  clear(): void {
    this.__embed?.clear();
  }

  private get __config(): PaymentCardEmbedConfig | null {
    type Leaves<T> = T extends Record<string, unknown>
      ? {
          [K in keyof T]: `${Exclude<K, symbol>}${Leaves<T[K]> extends never
            ? ''
            : `.${Leaves<T[K]>}`}`;
        }[keyof T]
      : never;

    const i18nKeys: Leaves<Required<PaymentCardEmbedConfig['translations']>>[] = [
      'stripe.label',
      'stripe.status.idle',
      'stripe.status.busy',
      'stripe.status.fail',
      'square.label',
      'square.status.idle',
      'square.status.busy',
      'square.status.fail',
      'default.cc-number.label',
      'default.cc-number.placeholder',
      'default.cc-number.v8n_required',
      'default.cc-number.v8n_invalid',
      'default.cc-number.v8n_unsupported',
      'default.cc-exp.label',
      'default.cc-exp.placeholder',
      'default.cc-exp.v8n_required',
      'default.cc-exp.v8n_invalid',
      'default.cc-exp.v8n_expired',
      'default.cc-csc.label',
      'default.cc-csc.placeholder',
      'default.cc-csc.v8n_required',
      'default.cc-csc.v8n_invalid',
      'default.status.idle',
      'default.status.busy',
      'default.status.fail',
      'default.status.misconfigured',
    ];

    const d1 = this.renderRoot.querySelector('#d1');
    const d2 = this.renderRoot.querySelector('#d2');
    const d3 = this.renderRoot.querySelector('#d3');

    if (!d1 || !d2 || !d3) return null;

    const d1Style = getComputedStyle(d1);
    const d2Style = getComputedStyle(d2);
    const d3Style = getComputedStyle(d3);

    const style: Record<string, string> = {
      '--lumo-space-m': d1Style.marginLeft,
      '--lumo-space-s': d1Style.marginRight,
      '--lumo-contrast-5pct': d1Style.backgroundColor,
      '--lumo-contrast-10pct': d1Style.color,
      '--lumo-contrast-50pct': d3Style.color,
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

    const translations: PaymentCardEmbedConfig['translations'] = {};
    i18nKeys.forEach(key => set(translations, key, this.t(key)));

    return {
      translations: translations,
      disabled: this.disabled,
      readonly: this.readonly,
      style: style,
      lang: this.lang,
    };
  }

  private __setupEmbed() {
    if (this.__embed) this.__embed.unmount();

    const config = this.__config;
    const root = this.renderRoot.querySelector('#iframe-container');
    const url = this.url;

    if (url === null || !root || !config || this.hidden) {
      this.__ready = false;
      this.__embed = null;
    } else {
      const This = this.constructor as typeof PaymentCardEmbedElement;
      this.__embed = new This.PaymentCardEmbed({ url, ...config });
      this.__embed.mount(root).then(() => (this.__ready = true));
      this.__embed.onsubmit = () => this.dispatchEvent(new CustomEvent('submit'));
    }
  }
}
