import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import { html, property } from 'lit-element';
import { Stateful } from '../../../mixins/stateful';
import { Product } from './private/Product';

import { QuickOrderContext, QuickOrderSchema, QuickOrderEvent, QuickOrderProduct } from './types';

import { machine } from './machine';
import { Section, Page, Code, I18N, Skeleton } from '../../private/index';

export class QuickOrder extends Stateful<QuickOrderContext, QuickOrderSchema, QuickOrderEvent> {
  public static get scopedElements() {
    return {
      'vaadin-integer-field': customElements.get('vaadin-integer-field'),
      'vaadin-password-field': customElements.get('vaadin-password-field'),
      'x-product': Product,
      'x-skeleton': Skeleton,
      'x-section': Section,
      'x-i18n': I18N,
      'x-page': Page,
      'x-code': Code,
    };
  }

  private __cdnUrl = 'https://static.www.foxycart.com/beta/s/customer-portal';
  private __storeUrl = 'https://my-store.tld/s/customer';
  private __modernUrl = `${this.__cdnUrl}/v0.9/dist/lumo/foxy/foxy.esm.js`;
  private __legacyUrl = `${this.__cdnUrl}/v0.9/dist/lumo/foxy/foxy.js`;

  constructor() {
    super(() => machine, 'quick-order');
  }

  @property({ type: Array })
  products: QuickOrderProduct[] = [];

  @property({ type: Boolean, noAccessor: true })
  public get disabled() {
    return this.service.state.matches('disabled');
  }
  public set disabled(value: boolean) {
    this.service.send(value ? 'DISABLE' : 'ENABLE');
  }

  public render() {
    if (!this.service.state.context) return;

    return html`
      <x-page>
        ${this.__renderHeader()}

        <x-section>
          <x-i18n slot="title" key="quickstart.title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
          <x-i18n
            slot="subtitle"
            key="quickstart.subtitle"
            .ns=${this.ns}
            .lang=${this.lang}
          ></x-i18n>

          ${this.products.map(
            (p: QuickOrderProduct) => html` <x-product
              .lang=${this.lang}
              .disabled=${this.disabled}
              .value=${p}
            ></x-product>`
          )}
        </x-section>
      </x-page>
    `;
  }

  private __renderHeader() {
    return html`
      <x-i18n class="block" slot="title" key="title" .ns=${this.ns} .lang=${this.lang}></x-i18n>
      <x-i18n
        class="block"
        slot="subtitle"
        key="subtitle"
        .ns=${this.ns}
        .lang=${this.lang}
      ></x-i18n>
    `;
  }

  private __renderCode() {
    return html`
      <x-code>
        <template>
          <script type="module" src=${this.__modernUrl}></script>
          <script nomodule src=${this.__legacyUrl}></script>
          <foxy-customer-portal endpoint=${this.__storeUrl}></foxy-customer-portal>
        </template>
      </x-code>
    `;
  }
}
