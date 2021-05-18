import type * as FoxySDK from '@foxy.io/sdk';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { NucleonElement } from '../../NucleonElement';
import { html } from 'lit-html';
import { CSSResult, CSSResultArray, LitElement, PropertyDeclarations, TemplateResult, css } from 'lit-element';
import { Themeable } from '../../../../mixins/themeable';

type ErrorEntries = FoxySDK.Backend.Rels.ErrorEntries;
type Data = FoxySDK.Core.Resource<ErrorEntries>;

export class ErrorEntry extends ScopedElementsMixin(NucleonElement)<Data> {

  open: boolean;

  static get properties() {
    return {
      ...super.properties,
      open: {type: Boolean}
    }
  }

  constructor() {
    super();
    this.open = false;
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles
    ];
  }

  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-customer-info': CustomerInfo,
      'foxy-transaction-info': TransactionInfo,
      'foxy-queryparams-viewer': URLSearchParamsViewer,
    }
  }

  render(): TemplateResult {
    return html`
    ${this.data?._embedded['fx:error_entries'].map(i => {
      return html`
        <article class='m-s text-body'>
          <header class='border-l-2 h-full p-s relative ${this.open ? 'border-error': 'border-primary'}'>
            <foxy-i18n key='date' options='{"value": "${i.date_created}"}' class='text-s ${this.open ? 'text-error': 'text-primary'}'></foxy-i18n>
            <foxy-i18n key='time' options='{"value": "${i.date_created}"}' class='text-s ${this.open ? 'text-error': 'text-primary'}'></foxy-i18n>
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
            <div>${i.error_message}</div>

          </header>
          ${this.open
            ? html`
              <main>
                <section class='my-s'>
                  <h1 class='text-tertiary text-m m-0 space-0'>Request</h1>
                  <main class='rounded-l border border-contrast-10 p-s'>
                    <p>${i.url}</p>
                    ${i.referrer
                      ? html`<span class='text-secondary'>Navigated from</span> <span>${i.referrer}</span>`
                      : html``
                    }
                    ${i.get_values
                      ? html`
                        <foxy-queryparams-viewer data='${i.get_values}' method='GET'></foxy-queryparams-viewer>`
                      : html``
                    }
                    ${i.post_values
                      ? html`<foxy-queryparams-viewer data='${i.post_values}' method='POST'></foxy-queryparams-viewer>`
                      : html``
                    }
                  </main>
                </section>
                ${i._links['fx:customer']?.href
                  ? html`<section class='space-y-s'>
                      <h1 class='text-disabled text-m space-y-s'>Client</h1>
                      <foxy-customer-info href="${i._links['fx:customer']?.href}"></foxy-customer-info>
                    </section> `
                  : ''
                }
                ${i._links['fx:transaction']?.href
                  ? html`<section class='space-y-s'>
                      <h1 class='text-disabled text-m space-y-s'>Transaction</h1>
                      <foxy-transaction-info href="${i._links['fx:transaction']?.href}"></foxy-transaction-info>
                    </section>`
                  : ''
                }

              </main>
            `
            : ``
          }
        </article>
      `
    })}`;
  }

  private __toggleOpen() {
    this.open = !this.open
  }
}

class CustomerInfo extends ScopedElementsMixin(NucleonElement)<FoxySDK.Core.Resource<FoxySDK.Backend.Rels.Customer>>{

  render(): TemplateResult {
    return this.data ?
      html`${this.data.first_name} ${this.data.last_name} (${this.data.email})` :
      html``
      ;
  }
}

class TransactionInfo extends ScopedElementsMixin(NucleonElement)<FoxySDK.Core.Resource<FoxySDK.Backend.Rels.Transaction>> {
  render(): TemplateResult {
    return this.data ?
      html`<a href='#'>${this.data.id} - ${this.data.currency_code}</a>`:
      html``;
  }
}


class URLSearchParamsViewer extends ScopedElementsMixin(LitElement) {

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
    }
  }

  data: URLSearchParams;

  method: 'GET'|'POST';

  constructor() {
    super();
    this.data = new URLSearchParams();
    this.method = 'GET';
  }

  render(): TemplateResult {
    return html`
      <div class='border-t-2 border-solid border-contrast-10 my-s relative overflow-hidden'>
        <div class='text-tertiary text-l absolute right-s top-0'>${this.method}</div>
        <dl class='mb-s'>
          ${
            Array.from(this.data.entries()).map(
              (e) => {
                return html`<dt class='text-secondary mt-s'>${e[0]}</dt><dd class='mt-s'>${e[1]}</dd>`;
              })}
        </dl>
      </div>

    `;
  }
}


function decodeHtml(html) {
    const areaElement = document.createElement("textarea");
    areaElement.innerHTML = html;
    return areaElement.value;
}
