import '@polymer/iron-icons';
import '@polymer/iron-icon';

import * as FoxySDK from '@foxy.io/sdk';

import { HypermediaResource, I18N, Skeleton } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { classMap } from '../../../utils/class-map';

type Attribute = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Attribute, undefined>;

export class FoxyAttributeElement extends HypermediaResource<Attribute> {
  static readonly defaultNodeName = 'foxy-attribute';

  static get scopedElements(): ScopedElementsMap {
    return {
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  readonly rel = 'attribute';

  constructor() {
    super('attribute');
  }

  render(): TemplateResult {
    const cssHeight = 'height: calc(var(--lumo-size-l) * 3)';
    const formClass = 'flex-1 rounded-t-l rounded-b-l divide-y divide-contrast-10';
    const inputClass = classMap({
      'h-m px-m w-full rounded': true,
      'hover:bg-contrast-5 focus:bg-contrast-5 focus:outline-none focus:shadow-outline': true,
    });

    const { ns, lang } = this;
    let form: TemplateResult;

    if (this._is('loading')) {
      form = html`<x-skeleton size="box" class="flex-1" style=${cssHeight}></x-skeleton>`;
    } else if (this._is('error')) {
      form = html`
        <div class="text-error bg-error-10 flex ${formClass}" style=${cssHeight}>
          <div class="flex m-auto items-center justify-center space-x-s">
            <iron-icon icon="icons:error-outline"></iron-icon>
            <x-i18n .ns=${ns} .lang=${lang} key="error" class="text-s"></x-i18n>
          </div>
        </div>
      `;
    } else {
      form = html`
        <form class="px-m border border-contrast-10 ${formClass}">
          <label class="group h-l grid grid-cols-2 items-center">
            <x-i18n .ns=${ns} .lang=${lang} class="text-secondary" key="name"></x-i18n>
            <input class=${inputClass} value=${this.resource!.name} />
          </label>

          <label class="h-l grid grid-cols-2 items-center">
            <x-i18n .ns=${ns} .lang=${lang} class="text-secondary" key="value"></x-i18n>
            <input class=${inputClass} value=${this.resource!.value} />
          </label>

          <label class="h-l grid grid-cols-2 items-center">
            <x-i18n .ns=${ns} .lang=${lang} class="text-secondary" key="visibility"></x-i18n>
            <select class="appearance-none ${inputClass}" value=${this.resource!.value}>
              <option value="private">${this._t('visibility_private')}</option>
              <option value="restricted">${this._t('visibility_restricted')}</option>
              <option value="public">${this._t('visibility_public')}</option>
            </select>
          </label>
        </form>
      `;
    }

    return html`
      <div
        class="flex text-body text-m font-lumo leading-m space-x-m"
        aria-live="polite"
        aria-busy=${this._is('loading')}
      >
        ${form}

        <div class="flex items-center justify-center">
          <button
            ?disabled=${!this._is('ready')}
            class=${classMap({
              'w-m h-m rounded-full flex items-center justify-center bg-error-10 text-error': true,
              'hover:bg-error hover:text-error-contrast focus:outline-none focus:shadow-outline-error': true,
              'disabled:cursor-default disabled:bg-contrast-5 disabled:text-tertiary': true,
            })}
          >
            <iron-icon icon="icons:delete"></iron-icon>
          </button>
        </div>
      </div>
    `;
  }
}
