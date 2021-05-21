import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { NucleonElement } from '../../NucleonElement';
import * as FoxySDK from '@foxy.io/sdk';
import { css, CSSResult, CSSResultArray, LitElement, PropertyDeclarations, TemplateResult } from 'lit-element';
import { html } from 'lit-html';
import { Themeable } from '../../../../mixins/themeable';
import { type } from 'os';


type Rel = FoxySDK.Backend.Rels.ErrorEntry;
type Data = FoxySDK.Core.Resource<Rel, undefined>;

export class ErrorEntry extends ScopedElementsMixin(NucleonElement)<Data> {

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
    ];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      open: { type: Boolean }
    };
  }

  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-custom-box': Box,
      'foxy-customer-info': CustomerInfo,
      'foxy-client-info': ClientInfo,
      'foxy-transaction-info': TransactionInfo,
      'foxy-params-viewer': URLSearchParamsViewer,
    };
  }

  open: boolean;

  constructor() {
    super();
    this.open = false;
  }

  render(): TemplateResult {
    if (!this.data) {
      return html`
        <div class="absolute inset-0 flex items-center justify-center">
          <foxy-spinner
              data-testid="spinner"
              class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
              layout="horizontal"
              >
          </foxy-spinner>
        </div>
      `;
    } else {
      return html`
        <article class='m-s text-body'>
          <header class='border-l-2 h-full p-s relative ${this.open ? 'border-error' : 'border-primary'}'>
            <vaadin-button @click=${this.__toggleOpen}
                  theme="icon"
                  class='text-s absolute right-s top-s rounded-full bg-transparent top-0 m-0 p-0'
                  aria-label='toggle'
                  >
                  ${this.open
                      ? html`<iron-icon icon='icons:expand-less'></iron-icon>`
                      : html`<iron-icon icon='icons:expand-more'></iron-icon>`
                      }
            </vaadin-button>
            ${this.data.hide_error ? html`<span class="px-s py-xs text-s font-medium tracking-wide rounded bg-success-10 text-success">Hidden</span>` : ''}
            <foxy-i18n key='date' options='{"value": "${this.data.date_created}"}' class='text-s ${this.open ? 'text-error' : 'text-primary'}'></foxy-i18n>
            <foxy-i18n key='time' options='{"value": "${this.data.date_created}"}' class='text-s ${this.open ? 'text-error' : 'text-primary'}'></foxy-i18n>
            <div>${this.data.error_message}</div>
          </header>
          ${this.open
              ? html`
                <main>
                  ${(this.data._links as any)['fx:customer']?.href
                      ? html`
                        <foxy-custom-box title="Customer">
                          <foxy-customer-info href="${(this.data._links as any)['fx:customer']?.href}"></foxy-customer-info>
                        </foxy-custom-box>
                      `
                      : ''
                      }
                      ${(this.data._links as any)['fx:transaction']?.href
                          ? html`
                            <foxy-custom-box title="Transaction">
                              <foxy-transaction-info href="${(this.data._links as any)['fx:transaction']?.href}"></foxy-transaction-info>
                            </foxy-custom-box>
                          `
                          : ''
                      }
                      ${this.data.user_agent}
                      <foxy-custom-box title="Client">
                        <foxy-client-info user-agent="${this.data.user_agent}" ip-address="${this.data.ip_address}" ip-country="${this.data.ip_country}"></foxy-client-info>
                      </foxy-custom-box>
                      </foxy-custom-box>
                      <foxy-custom-box title="Request">
                        <p>${this.data.url}</p>
                        ${this.data.referrer
                          ? html`<span class='text-secondary'>Navigated from</span> <a href='${this.data.referrer}'>${this.data.referrer}</a>`
                          : html``
                        }
                        ${this.data.get_values
                          ? html`
                            <foxy-params-viewer data='${this.data.get_values}' method='GET'></foxy-params-viewer>`
                          : html``
                        }
                        ${this.data.post_values
                          ? html`<foxy-params-viewer data='${this.data.post_values}' method='POST'></foxy-params-viewer>`
                          : html``
                        }
                      </foxy-custom-box>
                </main>
              `
              : ``
              }
        </article>
      `;
    }
  }

  private __toggleOpen() {
    this.open = !this.open;
  }
}

class CustomerInfo extends ScopedElementsMixin(NucleonElement)<FoxySDK.Core.Resource<FoxySDK.Backend.Rels.Customer>> {

  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-spinner': customElements.get('foxy-spinner'),
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [Themeable.styles]
  }

  render(): TemplateResult {
    if (this.in({ idle: 'template' }) || !this.in('idle')) {
      const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';
      return html`
        <div aria-live="polite" aria-busy=${this.in('busy')} data-testid="wrapper">
          <div class="h-full bg-contrast-5"></div>
          <div class="inset-0 flex justify-center">
            <foxy-spinner layout='horizontal' state=${spinnerState} data-testid="spinner"></foxy-spinner>
          </div>
        </div>
      `;
    } else {
      return this.data ?
        html`<span>${this.data.first_name} ${this.data.last_name}</span> <a class="text-s" href='mailto:${this.data.email}'>${this.data.email}</a>` :
        html``
        ;
    }
  }
}

class TransactionInfo extends ScopedElementsMixin(NucleonElement)<FoxySDK.Core.Resource<FoxySDK.Backend.Rels.Transaction>> {

  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-spinner': customElements.get('foxy-spinner'),
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [Themeable.styles]
  }

  render(): TemplateResult {
    if (this.in({ idle: 'template' }) || !this.in('idle')) {
      const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';
      return html`
        <div aria-live="polite" aria-busy=${this.in('busy')} data-testid="wrapper">
          <div class="h-full bg-contrast-5"></div>
          <div class="inset-0 flex justify-center w-full">
            <foxy-spinner layout='horizontal' state=${spinnerState} data-testid="spinner"></foxy-spinner>
          </div>
        </div>
      `;
    } else {
      return this.data ?
        html`<a href='${this.data._links.self.href}'>${this.data.id}</a> ${this.data.currency_symbol}${this.data.total_order}` :
        html``;
    }
  }
}

class ClientInfo extends Themeable {

  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-custom-keyvalues': KeyValues,
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
    ];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      userAgent: {
        attribute: 'user-agent',
        type: String
      },
      ipAddress: {
        attribute: 'ip-address',
        type: String
      },
      ipCountry: {
        attribute: 'ip-country',
        type: String
      },
    };
  }

  userAgent = "";

  ipAddress = "";

  ipCountry = "";

  render(): TemplateResult {
    if (this.userAgent === undefined) {
      return html``;
    } else {
      return html`
        <foxy-custom-keyvalues .data="${[
          ['User Agent', this.userAgent],
          ['IP Address', this.ipAddress],
          ['IP Country', this.ipCountry],
        ]}"></foxy-custom-keyvalues>
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
    return [
      Themeable.styles
    ];
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      method: {
        type: String
      },
      data: {
        converter: {
          fromAttribute(value: string): URLSearchParams {
            return new URLSearchParams(decodeHtml(value));
          },
          toAttribute(value: URLSearchParams): string {
            return value.toString();
          }
        },
        type: Object
      }
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
      <div class='border-t-2 border-solid border-contrast-10 my-s relative overflow-hidden'>
        <div class='text-tertiary text-l absolute right-s top-0'>${this.method}</div>
        <foxy-custom-keyvalues .data="${Array.from(this.data.entries())}"></foxy-custom-keyvalues>
      </div>
    `;
  }

}

function decodeHtml(html: string) {
  const areaElement = document.createElement('textarea');
  areaElement.innerHTML = html;
  return areaElement.value;
}


class Box extends Themeable {

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      title: {
        type: String
      }
    }
  }

  render(): TemplateResult {
    return html`
      <section class='my-s'>
        <h1 class='text-tertiary text-m m-0 space-0'>${this.title}</h1>
        <div class='rounded-l border border-contrast-10 p-s'>
          <slot></slot>
        </div>
      </section>`
      }
}

class KeyValues extends Themeable {

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
      css`
        dt, dd {
          display: inline-block;
          overflow: hidden;
          vertical-align: top;
          overflow-wrap: anywhere;
        }
        dt:before {
          display: block;
          content: ' ';
        }
        dt {
          min-width: 150px;
          width: calc( 25% - 0.5em);
          padding-right: 0.5em;
        }
        dd {
          width: 75%;
        }
      `
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
          }
        }
      }
    }
  }

  data: [string, unknown][] = [];

  render() {
    return html`
      <dl class='mb-s'>
        ${this.data.map(
          (e) => html`<dt class='text-secondary mt-s'>${e[0]}</dt><dd class='mt-s'>${e[1]}</dd>`
          )}
      </dl>
    `;
  }


}
