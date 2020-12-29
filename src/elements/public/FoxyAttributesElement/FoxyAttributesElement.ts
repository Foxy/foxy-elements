import '@polymer/iron-icons';
import '@polymer/iron-icon';

import * as FoxySDK from '@foxy.io/sdk';

import { ErrorScreen, I18N, Skeleton } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { FoxyAttributeElement } from '../FoxyAttributeElement';
import { HypermediaCollection } from '../../private/HypermediaCollection/HypermediaCollection';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { classMap } from '../../../utils/class-map';

type Attributes = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Attributes, undefined>;

export class FoxyAttributesElement extends HypermediaCollection<Attributes> {
  static readonly defaultNodeName = 'foxy-attributes';

  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-attribute': customElements.get(FoxyAttributeElement.defaultNodeName),
      'x-error-screen': ErrorScreen,
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  constructor() {
    super('attributes');
  }

  render(): TemplateResult {
    return html`
      <article class="font-lumo text-body leading-m space-y-l">
        <header class="space-x-m flex items-center justify-between md:justify-start">
          <h1 class="text-xl font-medium">
            <x-i18n .ns=${this.ns} .lang=${this.lang} key="header"></x-i18n>
          </h1>

          <button
            aria-label=${this._t('add').toString()}
            class=${classMap({
              'flex-shrink-0 h-m w-m rounded-full flex items-center justify-center bg-primary-10 text-primary': true,
              'hover:bg-primary hover:text-primary-contrast': true,
              'focus:outline-none focus:shadow-outline': true,
            })}
          >
            <iron-icon icon="icons:add"></iron-icon>
          </button>
        </header>

        <div class="space-y-m" aria-live="polite" aria-busy=${this._is('busy.fetching')}>
          ${this.pages.map(page => {
            return page._embedded['fx:attributes'].map(attribute => {
              return html`
                <foxy-attribute .lang=${this.lang} .resource=${attribute}></foxy-attribute>
              `;
            });
          })}
        </div>

        <div class="relative">
          <div class="space-y-m">
            ${this._is('busy.fetching') || this._is('error')
              ? new Array(this._getLimit()).fill(0).map(() => {
                  return html`
                    <div class="flex items-center space-x-m">
                      <x-skeleton
                        variant=${this._is('error') ? 'error' : 'busy'}
                        style="height: calc(var(--lumo-size-l) * 3)"
                        class="flex-1"
                        size="box"
                      >
                      </x-skeleton>
                      <x-skeleton
                        variant=${this._is('error') ? 'error' : 'busy'}
                        class="w-m h-m rounded-full overflow-hidden"
                        size="box"
                      >
                      </x-skeleton>
                    </div>
                  `;
                })
              : ''}
          </div>

          ${this._is('error') ? html`<x-error-screen></x-error-screen>` : ''}
        </div>

        <div id="trigger"></div>
      </article>
    `;
  }

  protected get _trigger(): HTMLElement {
    return this.renderRoot!.getElementById('trigger')!;
  }
}
