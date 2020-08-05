import '@vaadin/vaadin-text-field/vaadin-integer-field';
import '@vaadin/vaadin-text-field/vaadin-password-field';
import { html, property } from 'lit-element';
import { Translatable } from '../../../mixins/translatable';
import { interpret } from 'xstate';
import { Product } from './private/Product';

import { QuickOrderProduct } from './types';

import { machine } from './machine';
import { Section, Page, Code, I18N, Skeleton } from '../../private/index';

type CustomWindow = Window & { FC?: any };
export class QuickOrder extends Translatable {
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

  private __defaultSubdomain = 'jamstackecommerceexample.foxycart.com';

  @property({ type: String })
  public storeSubdomain = this.__defaultSubdomain;

  constructor() {
    super('quick-order');
    this.loadFoxy();
  }

  /** Creates a script tag for loader.js if it not exists and sets a
   * ready.done callback */
  private loadFoxy() {
    if (!('FC' in window)) {
      // Compute src
      let storeName = this.storeSubdomain;
      if (this.storeSubdomain.endsWith('.foxycart.com')) {
        storeName = this.storeSubdomain.replace('.foxycart.com', '');
      }
      const src = `https://cdn.foxycart.com/${storeName}/loader.js`;
      // Check if script is present
      const loader = document.querySelector(`script[src="${src}"]`);
      // Insert loader if not present
      if (!loader) {
        const script = document.createElement('script');
        if (!document.querySelector('foxy-loader-script')) {
          script.type = 'text/javascript';
          script.setAttribute('data-cfasync', 'false');
          script.async = true;
          script.defer = true;
          script.setAttribute('id', 'foxy-loader-script');
          let storeName = this.storeSubdomain;
          if (this.storeSubdomain.endsWith('.foxycart.com')) {
            storeName = this.storeSubdomain.replace('.foxycart.com', '');
          }
          script.src = src;
          document.head.appendChild(script);
        }
      }
      const W = window as CustomWindow;
      W.FC = W.FC || {};
      // Create FC onload
      const originalCallback = W.FC.onLoad;
      W.FC.onLoad = () => {
        if (originalCallback != undefined) {
          originalCallback();
        }
        W.FC.client.on('ready.done', () => {
          this.updateFromFC();
        });
      };
    }
  }

  /** Update the form with values from FC */
  private updateFromFC() {
    const FC = (window as CustomWindow).FC;
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

  public service = interpret(machine)
    .onChange(() => this.requestUpdate())
    .onTransition(() => this.requestUpdate())
    .start();

  public render() {
    return html`
      <x-page>
        Produtos ${this.products} ${this.__renderHeader()}

        <x-section class="products">
          ${this.products.map(
            (p: QuickOrderProduct) => html`<x-product
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
}
