import * as FoxySDK from '@foxy.io/sdk';

import { CSSResultArray, css } from 'lit-element';
import { ErrorScreen, Skeleton } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { FoxyItemElement } from '../FoxyItemElement';
import { HypermediaCollection } from '../../private/HypermediaCollection/HypermediaCollection';
import { ScopedElementsMap } from '@open-wc/scoped-elements';

type Items = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Items, undefined>;

export class FoxyItemsElement extends HypermediaCollection<Items> {
  static readonly defaultNodeName = 'foxy-items';

  static get scopedElements(): ScopedElementsMap {
    return {
      'x-error-screen': ErrorScreen,
      'x-skeleton': Skeleton,
      'foxy-item': customElements.get(FoxyItemElement.defaultNodeName),
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

  readonly rel = 'items';

  render(): TemplateResult {
    return html`
      <div
        class="relative gap-m grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      >
        ${this.pages.map(page => {
          return page._embedded['fx:items'].map(item => {
            return html`<foxy-item .lang=${this.lang} .resource=${item}></foxy-item>`;
          });
        })}
        ${this._is('busy.fetching') || this._is('error')
          ? new Array(this._getLimit()).fill(0).map(() => {
              const variant = this._is('error') ? 'error' : 'busy';
              return html`
                <div class="space-y-s">
                  <div class="relative ratio-1-1">
                    <x-skeleton size="box" variant=${variant} class="absolute inset-0"></x-skeleton>
                  </div>

                  <div class="leading-s font-lumo leading-m">
                    <x-skeleton class="block text-m" variant=${variant}></x-skeleton>
                    <x-skeleton class="block text-s" variant=${variant}></x-skeleton>
                  </div>
                </div>
              `;
            })
          : ''}
        ${this._is('error') ? html`<x-error-screen></x-error-screen>` : ''}
      </div>

      <div id="trigger"></div>
    `;
  }

  protected get _trigger(): HTMLElement {
    return this.renderRoot!.getElementById('trigger')!;
  }
}
