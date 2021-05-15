import type * as FoxySDK from '@foxy.io/sdk';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { NucleonElement } from '../../NucleonElement/NucleonElement';
import { html } from 'lit-html';
import { CSSResult, CSSResultArray, TemplateResult } from 'lit-element';
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
      'foxy-transaction-info': TransactionInfo
    }
  }

  render(): TemplateResult {
    return html`
    ${this.data?._embedded['fx:error_entries'].map(i => {
      return html`
        <article class='m-s text-body'>
          <header class='border-l-2 h-full p-s relative ${this.open ? 'border-error': 'border-primary'}'>
            <foxy-i18n key='date' options='{"value": "${i.date_created}"}' class='${this.open ? 'text-error': 'text-primary'}'></foxy-i18n>
            <div>${i.error_message}</div>
            <vaadin-button @click=${this.__toggleOpen}
                           theme="icon"
                           class='absolute right-s top-s rounded-full'
                           aria-label='toggle'
            >
              ${this.open
                ? html`<iron-icon icon='icons:expand-less'></iron-icon>`
                : html`<iron-icon icon='icons:expand-more'></iron-icon>`
              }
            </vaadin-button>
          </header>
          ${this.open
            ? html`
              <main>
                <section class='my-s'>
                  <h1 class='text-disabled text-m m-0 space-0'>Request</h1>
                  <main class='rounded-l border border-contrast-10 p-s'>
                    <p>${i.url}</p>
                    ${i.referrer
                      ? html`<span>Navigated from</span> <span>${i.referrer}</span>`
                      : html``
                    }
                    ${i.get_values
                      ? html`<div>Here comes the get values ${i.get_values}</div>`
                      : html``
                    }
                    ${i.post_values
                      ? html`<div>Here comes the post values ${i.post_values}</div>`
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
