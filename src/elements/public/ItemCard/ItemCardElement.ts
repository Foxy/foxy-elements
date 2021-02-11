import { CSSResultArray, css } from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { TemplateResult, html } from 'lit-html';

import { Data } from './types';
import { NucleonElement } from '../NucleonElement/index';
import { Skeleton } from '../../private/index';
import { Themeable } from '../../../mixins/themeable';

const TRANSPARENT_PIXEL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export class ItemCardElement extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'foxy-i18n': customElements.get('foxy-i18n'),
    };
  }

  static get styles(): CSSResultArray {
    return [
      Themeable.styles,
      css`
        .ratio-1-1 {
          padding-bottom: 100%;
        }
      `,
    ];
  }

  private static __ns = 'item-card';

  render(): TemplateResult {
    const { lang, state } = this;

    const isLoading = state.matches('busy');
    const isError = state.matches('fail');

    const variant = isError ? 'error' : 'busy';
    const center = 'flex items-center justify-center';
    const inset = 'absolute inset-0';
    const ns = ItemCardElement.__ns;

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
                  <foxy-i18n ns=${ns} lang=${lang} key="error"></foxy-i18n>
                </div>
              `
            : html`
                <img
                  src=${state.context.data?.image || TRANSPARENT_PIXEL}
                  class="${inset} w-full h-full bg-contrast-10 object-cover"
                />
              `}
        </div>

        <figcaption class="leading-s">
          <div class="truncate font-medium">
            ${isLoading || isError
              ? html`<x-skeleton variant=${variant}></x-skeleton>`
              : state.context.data?.name ?? ''}
          </div>

          <div class="text-s truncate text-secondary">
            ${isLoading || isError
              ? html`<x-skeleton variant=${variant}></x-skeleton>`
              : html`<foxy-i18n ns=${ns} lang=${lang} key="summary"></foxy-i18n>`}
          </div>
        </figcaption>
      </figure>
    `;
  }
}
