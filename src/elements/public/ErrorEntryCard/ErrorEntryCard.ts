import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { NucleonElement } from '../NucleonElement';
import * as FoxySDK from '@foxy.io/sdk';
import {
  CSSResult,
  CSSResultArray,
  LitElement,
  PropertyDeclarations,
  TemplateResult,
  css,
} from 'lit-element';
import { html } from 'lit-html';
import { Themeable } from '../../../mixins/themeable';
import { CheckboxElement } from '@vaadin/vaadin-checkbox';
import { ButtonElement } from '@vaadin/vaadin-button';
import { Group } from '../../private';

type Rel = FoxySDK.Backend.Rels.ErrorEntry;
type Data = FoxySDK.Core.Resource<Rel, undefined>;

/**
 * Displays an ErrorEntry from the Log of FoxyAPI.
 *
 * A summary of the Error Entry is presented
 *
 * @element foxy-error-entry-card
 *
 */
export class ErrorEntryCard extends ScopedElementsMixin(NucleonElement)<Data> {
  static get styles(): CSSResult | CSSResultArray {
    return [Themeable.styles];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      open: { type: Boolean, reflect: true },
    };
  }

  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'vaadin-button': ButtonElement,
      'vaadin-checkbox': CheckboxElement,
      'x-customer-info-card': CustomerInfoCard,
      'x-client-info-card': ClientInfoCard,
      'x-transaction-info-card': TransactionInfoCard,
      'x-params-viewer': URLSearchParamsViewer,
      'x-group': Group,
    };
  }

  /**
   * **Required** Boolean. When first set to true triggers an update to the error entry, marking it
   * as read.
   */
  open = false;

  private __ns = 'error-entry';

  constructor() {
    super();
  }

  render(): TemplateResult {
    if (!this.data) {
      return html`
        <div class="absolute inset-0 flex items-center justify-center">
          <foxy-spinner
            data-testid="spinner"
            class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            layout="horizontal"
            state=${this.in('busy') ? 'busy' : 'error'}
          >
          </foxy-spinner>
        </div>
      `;
    } else {
      return html`
        <div
          aria-busy=${this.in('busy')}
          aria-live="polite"
          class="flex flex-auto content-center w-full ${this.data.hide_error
            ? 'text-tertiary'
            : ''}"
        >
          <details class="m-s text-body w-full " @toggle=${this.__toggleOpen} ?open=${this.open}>
            <summary
              class="border-l-2 p-s relative cursor-pointer ${this.data.hide_error
                ? 'border-error'
                : 'border-primary'}"
            >
              <p class="text-s absolute right-s top-s rounded-full bg-transparent top-0 m-0 p-0">
                ${this.open
                  ? html`<iron-icon icon="icons:expand-less"></iron-icon>`
                  : html`<iron-icon icon="icons:expand-more"></iron-icon>`}
              </p>
              <foxy-i18n
                key="date"
                options='{"value": "${this.data.date_created}"}'
                class="text-s ${this.data.hide_error ? 'text-error' : 'text-primary'}"
              ></foxy-i18n>
              <foxy-i18n
                key="time"
                options='{"value": "${this.data.date_created}"}'
                class="text-s ${this.data.hide_error ? 'text-error' : 'text-primary'}"
              ></foxy-i18n>
              <div class="${this.open ? '' : 'truncate'} overflow-hidden">
                ${this.data.error_message}
              </div>
            </summary>
            ${(this.data._links as any)['fx:customer']?.href
              ? html`
                  <x-group class="my-s" frame="true">
                    <h1 class="text-tertiary text-m m-0 space-0" slot="header">
                      <foxy-i18n key="customer" .ns=${this.__ns}></foxy-i18n>
                    </h1>
                    <x-customer-info-card
                      class="m-s"
                      href="${(this.data._links as any)['fx:customer']?.href}"
                    ></x-customer-info-card>
                  </x-group>
                `
              : ''}
            ${(this.data._links as any)['fx:transaction']?.href
              ? html`
                  <x-group class="my-s" frame="true">
                    <h1 class="text-tertiary text-m m-0 space-0" slot="header">
                      <foxy-i18n key="transaction" .ns=${this.__ns}></foxy-i18n>
                    </h1>
                    <x-transaction-info-card
                      class="m-s"
                      href="${(this.data._links as any)['fx:transaction']?.href}"
                    ></x-transaction-info-card>
                  </x-group>
                `
              : ''}
            <x-group class="my-s" frame="true">
              <h1 class="text-tertiary text-m m-0 space-0" slot="header">
                <foxy-i18n key="client" .ns=${this.__ns}></foxy-i18n>
              </h1>
              <x-client-info-card
                class="m-s"
                user-agent="${this.data.user_agent}"
                ip-address="${this.data.ip_address}"
                ip-country="${this.data.ip_country}"
              ></x-client-info-card>
            </x-group>
            <x-group class="my-s" frame="true">
              <h1 class="text-tertiary text-m m-0 space-0" slot="header">
                <foxy-i18n key="request" .ns=${this.__ns}></foxy-i18n>
              </h1>
              <div class="p-m">
                <p>${this.data.url}</p>
                ${this.data.referrer
                  ? html`<span class="text-secondary">Navigated from</span>
                      <a href="${this.data.referrer}">${this.data.referrer}</a>`
                  : html``}
                ${this.data.get_values
                  ? html` <x-params-viewer
                      data="${this.data.get_values}"
                      method="GET"
                    ></x-params-viewer>`
                  : html``}
                ${this.data.post_values
                  ? html`<x-params-viewer
                      data="${this.data.post_values}"
                      method="POST"
                    ></x-params-viewer>`
                  : html``}
              </div>
            </x-group>
            ${this.in('idle')
              ? ''
              : html`
                  <div class="absolute inset-0 flex items-center justify-center">
                    <foxy-spinner
                      data-testid="spinner"
                      class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                      layout="horizontal"
                      state=${this.in('busy') ? 'busy' : 'error'}
                    >
                    </foxy-spinner>
                  </div>
                `}
          </details>
        </div>
      `;
    }
  }

  private __toggleOpen(event: Event) {
    const details = event.target as HTMLDetailsElement;
    if (event.type == 'toggle' && details.open) {
      if (this.data && !this.data.hide_error) {
        const edited: any = { ...this.data, hide_error: true };
        delete edited['_links'];
        this.edit(edited);
        this.submit();
      }
    }
    this.open = details.open;
  }
}

/**
 * A simplified information set from Customer to be used within ErrorEntry.
 */
class CustomerInfoCard extends ScopedElementsMixin(NucleonElement)<
  FoxySDK.Core.Resource<FoxySDK.Backend.Rels.Customer>
> {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-spinner': customElements.get('foxy-spinner'),
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [Themeable.styles];
  }

  render(): TemplateResult {
    if (this.in({ idle: 'template' }) || !this.in('idle')) {
      const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';
      return html`
        <div aria-live="polite" aria-busy=${this.in('busy')} data-testid="wrapper">
          <div class="h-full bg-contrast-5"></div>
          <div class="inset-0 flex justify-center">
            <foxy-spinner
              layout="horizontal"
              state=${spinnerState}
              data-testid="spinner"
            ></foxy-spinner>
          </div>
        </div>
      `;
    } else {
      return this.data
        ? html`<span>${this.data.first_name} ${this.data.last_name}</span>
            <a class="text-s" href="mailto:${this.data.email}">${this.data.email}</a>`
        : html``;
    }
  }
}

/**
 * A simplified information set from Transaction to be used within ErrorEntry.
 */
class TransactionInfoCard extends ScopedElementsMixin(NucleonElement)<
  FoxySDK.Core.Resource<FoxySDK.Backend.Rels.Transaction>
> {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-spinner': customElements.get('foxy-spinner'),
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [Themeable.styles];
  }

  render(): TemplateResult {
    if (this.in({ idle: 'template' }) || !this.in('idle')) {
      const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';
      return html`
        <div aria-live="polite" aria-busy=${this.in('busy')} data-testid="wrapper">
          <div class="h-full bg-contrast-5"></div>
          <div class="inset-0 flex justify-center w-full">
            <foxy-spinner
              layout="horizontal"
              state=${spinnerState}
              data-testid="spinner"
            ></foxy-spinner>
          </div>
        </div>
      `;
    } else {
      return this.data
        ? html`<a href="${this.data._links.self.href}">${this.data.id}</a> ${this.data
              .currency_symbol}${this.data.total_order}`
        : html``;
    }
  }
}

class ClientInfoCard extends Themeable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-custom-keyvalues': KeyValues,
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [Themeable.styles];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      userAgent: {
        attribute: 'user-agent',
        type: String,
      },
      ipAddress: {
        attribute: 'ip-address',
        type: String,
      },
      ipCountry: {
        attribute: 'ip-country',
        type: String,
      },
    };
  }

  userAgent = '';

  ipAddress = '';

  ipCountry = '';

  render(): TemplateResult {
    if (this.userAgent === undefined) {
      return html``;
    } else {
      return html`
        <foxy-custom-keyvalues
          .data="${[
            ['User Agent', this.userAgent],
            ['IP Address', this.ipAddress],
            ['IP Country', this.ipCountry],
          ]}"
        ></foxy-custom-keyvalues>
      `;
    }
  }
}

class URLSearchParamsViewer extends ScopedElementsMixin(LitElement) {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-custom-keyvalues': KeyValues,
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [Themeable.styles];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      method: {
        type: String,
      },
      data: {
        converter: {
          fromAttribute(value: string): URLSearchParams {
            return new URLSearchParams(decodeHtml(value));
          },
          toAttribute(value: URLSearchParams): string {
            return value.toString();
          },
        },
        type: Object,
      },
    };
  }

  data: URLSearchParams;

  method: 'GET' | 'POST';

  constructor() {
    super();
    this.data = new URLSearchParams();
    this.method = 'GET';
  }

  render(): TemplateResult {
    return html`
      <div class="border-t-2 border-solid border-contrast-10 my-s relative overflow-hidden">
        <div class="text-tertiary text-l absolute right-s top-0">${this.method}</div>
        <foxy-custom-keyvalues .data="${Array.from(this.data.entries())}"></foxy-custom-keyvalues>
      </div>
    `;
  }
}

/**
 * @param html
 */
function decodeHtml(html: string) {
  const areaElement = document.createElement('textarea');
  areaElement.innerHTML = html;
  return areaElement.value;
}

class KeyValues extends Themeable {
  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
      css`
        dt,
        dd {
          display: inline-block;
          overflow: hidden;
          vertical-align: top;
          overflow-wrap: anywhere;
        }
        dt {
          min-width: calc(5 * var(--lumo-size-l));
          padding-right: 0.5em;
        }
        dd {
          max-width: calc(15 * var(--lumo-size-l));
          min-width: calc(10 * var(--lumo-size-l));
        }
      `,
    ];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      data: {
        converter: {
          fromAttribute(value: string): [string, unknown][] {
            const obj = (typeof value === 'string' && JSON.parse(value)) || value;
            return Object.entries(obj);
          },
          toAttribute(value: [string, unknown][]): string {
            return JSON.stringify(value);
          },
        },
      },
    };
  }

  data: [string, unknown][] = [];

  render() {
    return html`
      <dl class="mb-s">
        ${this.data.map(
          e =>
            html`<div>
              <dt class="text-secondary mt-s truncate">${e[0]}</dt>
              <dd class="mt-s">${e[1]}</dd>
            </div>`
        )}
      </dl>
    `;
  }
}
