import '@polymer/iron-icons';
import '@polymer/iron-icon';

import * as FoxySDK from '@foxy.io/sdk';

import { CSSResultArray, css } from 'lit-element';
import { HypermediaResource, I18N, Skeleton } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';

type Item = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Item, undefined>;

const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export class FoxyItemElement extends HypermediaResource<Item> {
  static readonly defaultNodeName = 'foxy-item';

  static get scopedElements(): ScopedElementsMap {
    return {
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .ratio-1-1 {
          padding-bottom: 100%;
        }
      `,
    ];
  }

  readonly rel = 'item';

  constructor() {
    super('item');
  }

  render(): TemplateResult {
    const isLoading = this._is('busy.fetching');
    const isError = this._is('error');
    const variant = isError ? 'error' : 'busy';
    const inset = 'absolute inset-0';
    const center = 'flex items-center justify-center';

    return html`
      <figure
        class="space-y-s text-m font-lumo leading-m text-body"
        aria-busy=${isLoading}
        aria-live="polite"
      >
        <div class="relative ratio-1-1 rounded-t-l rounded-b-l overflow-hidden">
          ${isLoading
            ? html`<x-skeleton size="box" class=${inset}></x-skeleton>`
            : isError
            ? html`
                <x-skeleton size="box" class=${inset} variant="error"></x-skeleton>
                <div class="text-error text-s flex-col space-y-xs ${center} ${inset}">
                  <iron-icon icon="icons:error-outline"></iron-icon>
                  <x-i18n .ns=${this.ns} .lang=${this.lang} key="error"></x-i18n>
                </div>
              `
            : html`
                <img
                  src=${this.resource?.image || TRANSPARENT_PIXEL}
                  class="${inset} w-full h-full bg-contrast-10 object-cover"
                />
              `}
        </div>

        <figcaption class="leading-s">
          <div class="truncate font-medium">
            ${isLoading || isError
              ? html`<x-skeleton variant=${variant}></x-skeleton>`
              : this.resource?.name ?? ''}
          </div>

          <div class="text-s truncate text-secondary">
            ${isLoading || isError
              ? html`<x-skeleton variant=${variant}></x-skeleton>`
              : html`<x-i18n ns=${this.ns} lang=${this.lang} key="summary"></x-i18n>`}
          </div>
        </figcaption>
      </figure>
    `;
  }
}
