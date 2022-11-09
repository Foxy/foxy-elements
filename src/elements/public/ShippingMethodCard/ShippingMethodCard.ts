import type { Data, StoreShippingMethods } from './types';
import type { PropertyDeclarations } from 'lit-element';
import type { NucleonElement } from '../NucleonElement/NucleonElement';
import type { TemplateResult } from 'lit-html';
import type { Resource } from '@foxy.io/sdk/core';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalCard } from '../../internal/InternalCard/InternalCard';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

const NS = 'shipping-method-card';
const Base = TranslatableMixin(InternalCard, NS);

export class ShippingMethodCard extends Base<Data> {
  static get defaultImageSrc(): string {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' fill='none' viewBox='0 0 40 40'%3E%3Cg clip-path='url(%23a)'%3E%3Cpath fill='%23E8E8E8' d='M0 0h40v40H0z'/%3E%3Cpath fill='%23fff' d='M0 14.81V7.88L7.88 0h6.93L0 14.81ZM0 0h6.47L0 6.47V0Zm16.22 0L0 16.22v6.93l9-9V14c0-.55.2-1.02.59-1.41.39-.4.86-.59 1.41-.59h.15l12-12h-6.93ZM9 15.57l-9 9v6.93l9-9v-6.93Zm.15 8.19L0 32.91v6.93l12.33-12.33a3.28 3.28 0 0 1-.46-.39A2.9 2.9 0 0 1 11 25c-.55 0-1.02-.2-1.41-.59a2 2 0 0 1-.44-.65Zm4.17 4.17L1.26 40h6.92L23 25.18V25h-6c0 .83-.3 1.54-.88 2.13A2.9 2.9 0 0 1 14 28a3.2 3.2 0 0 1-.68-.07Zm11.85-3.5.26-.26A.98.98 0 0 1 26 24c.28 0 .52.1.71.29.2.19.29.43.29.71 0 .28-.1.52-.29.71A.94.94 0 0 1 26 26a.97.97 0 0 1-.71-.29A.97.97 0 0 1 25 25a1 1 0 0 1 .17-.57Z'/%3E%3Cpath fill='%23fff' d='M23.29 26.31 9.59 40h6.94L40 16.53V9.6l-9.6 9.6.4.53c.07.08.12.17.15.27s.05.2.05.32V24c0 .28-.1.52-.29.71A.94.94 0 0 1 30 25h-1c0 .83-.3 1.54-.88 2.13A2.9 2.9 0 0 1 26 28a3 3 0 0 1-2.71-1.69Zm6.51-7.92L40 8.19V1.25L25.26 16h2.24a1 1 0 0 1 .45.1 1 1 0 0 1 .35.3l1.5 1.99ZM25 14.84 39.84 0h-6.93l-12 12H23c.55 0 1.02.2 1.41.59.4.39.59.86.59 1.41v.84ZM19.5 12l12-12h-6.93l-12 12h6.93Zm-1.56 28L40 17.94v6.93L24.87 40h-6.93ZM40 26.29 26.29 40h6.93L40 33.22v-6.93ZM34.63 40 40 34.63V40h-5.37ZM13 25c0 .28.1.52.29.71.19.2.43.29.71.29.28 0 .52-.1.71-.29.2-.19.29-.43.29-.71 0-.28-.1-.52-.29-.71A.97.97 0 0 0 14 24c-.07 0-.14 0-.2.02a.95.95 0 0 0-.51.27.95.95 0 0 0-.29.71Z'/%3E%3Cpath fill='%23fff' d='M25 18v3h4.21l-.85-1.18-.68-.91L27 18h-2Z'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='a'%3E%3Cpath fill='%23fff' d='M0 0h40v40H0z'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E";
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      storeShippingMethods: { type: String, attribute: 'store-shipping-methods' },
      getImageSrc: { attribute: false },
    };
  }

  storeShippingMethods: string | null = null;

  getImageSrc: ((type: string) => string) | null = null;

  renderBody(): TemplateResult {
    const defaultSrc = ShippingMethodCard.defaultImageSrc;
    const data = this.data;

    type Methods = Resource<StoreShippingMethods, { zoom: 'shipping_method' }>;
    type MethodsLoader = NucleonElement<Methods>;

    const methods = this.renderRoot.querySelector<MethodsLoader>('#methods');
    const isActive = methods?.data?._embedded?.['fx:store_shipping_methods']?.length === 1;

    let storeShippingMethodsHref: string | undefined;

    try {
      const url = new URL(this.storeShippingMethods!);

      url.searchParams.set('shipping_method_id', this.href.split('/').pop()!);
      url.searchParams.set('limit', '1');

      storeShippingMethodsHref = url.toString();
    } catch {
      storeShippingMethodsHref = undefined;
    }

    return html`
      ${typeof storeShippingMethodsHref === 'string'
        ? html`
            <foxy-nucleon
              class="hidden"
              infer=""
              href=${ifDefined(storeShippingMethodsHref)}
              id="methods"
              @update=${() => this.requestUpdate()}
            >
            </foxy-nucleon>
          `
        : ''}

      <figure class="flex items-center gap-m h-m">
        <img
          class="relative h-s w-s object-cover rounded-full bg-contrast-20 flex-shrink-0 shadow-xs"
          src=${(data ? this.getImageSrc?.(data.code) : null) ?? defaultSrc}
          alt=${this.t('image_alt')}
          @error=${(evt: Event) => ((evt.currentTarget as HTMLImageElement).src = defaultSrc)}
        />

        <figcaption class="min-w-0 flex-1">
          <dl class="flex justify-between gap-s">
            <dt class="sr-only">${this.t('title_description')}</dt>
            <dd class="font-semibold truncate flex-shrink-0">${data?.name}&ZeroWidthSpace;</dd>

            ${isActive
              ? html`
                  <dt class="sr-only">${this.t('subtitle_description')}</dt>
                  <dd class="truncate text-tertiary">${this.t('status_active')}</dd>
                `
              : ''}
          </dl>
        </figcaption>
      </figure>
    `;
  }
}
