import '@polymer/iron-icon';
import '@polymer/iron-icons';

import * as FoxySDK from '@foxy.io/sdk';

import { HypermediaResource, I18N, Skeleton } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { CSSResultArray } from 'lit-element';
import { FormDialog } from './private/FormDialog';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { css } from 'lit-element/lib/css-tag';

type Attribute = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Attribute, undefined>;

export class AttributeCardElement extends HypermediaResource<Attribute> {
  static readonly defaultNodeName = 'foxy-attribute-card';

  static get scopedElements(): ScopedElementsMap {
    return {
      'x-form-dialog': FormDialog,
      'x-skeleton': Skeleton,
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host(:focus-within) {
          box-shadow: 0 0 0 2px var(--lumo-primary-color-50pct);
        }
      `,
    ];
  }

  readonly rel = 'attribute';

  constructor() {
    super('attribute-card');
  }

  render(): TemplateResult {
    const isBusy = this._is('busy');
    const isIdle = this._is('idle');
    const variant = isBusy ? 'busy' : 'error';

    return html`
      <x-form-dialog
        .href=${this.href}
        .ns=${this.ns}
        .lang=${this.lang}
        id="form-dialog"
        header="edit"
      >
      </x-form-dialog>

      <figure
        role="button"
        tabindex="0"
        class="text-body text-l font-lumo leading-s focus:outline-none"
        aria-live="polite"
        aria-busy=${isBusy}
        @click=${() => {
          if (this._is('idle.snapshot')) {
            const dialog = this.renderRoot.querySelector('#form-dialog') as FormDialog;
            dialog.show();
          }
        }}
      >
        <figcaption class="uppercase text-xxs font-medium text-tertiary tracking-wider">
          ${isIdle
            ? html`<span class="truncate">${this.resource!.name}</span>`
            : html`<x-skeleton variant=${variant} class="w-full"></x-skeleton>`}
        </figcaption>

        ${isIdle
          ? html`<span class="truncate">${this.resource!.value}</span>`
          : html`<x-skeleton variant=${variant} class="w-full"></x-skeleton>`}
      </figure>
    `;
  }
}
