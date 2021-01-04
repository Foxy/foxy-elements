import * as FoxySDK from '@foxy.io/sdk';

import { ErrorScreen, HypermediaResource, I18N, LoadingScreen } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { ConfirmDialog } from '../../private/Dialog/ConfirmDialog';
import { FoxyAttributesElement } from '../FoxyAttributesElement';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';

type CustomerAddress = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customer, undefined>;

export class FoxyCustomerFormElement extends HypermediaResource<CustomerAddress> {
  static readonly defaultNodeName = 'foxy-customer-form';

  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': TextFieldElement,
      'x-confirm-dialog': ConfirmDialog,
      'x-loading-screen': LoadingScreen,
      'foxy-attributes': customElements.get(FoxyAttributesElement.defaultNodeName),
      'x-error-screen': ErrorScreen,
      'vaadin-button': ButtonElement,
      'x-i18n': I18N,
    };
  }

  readonly rel = 'customer';

  constructor() {
    super('customer-form');
  }

  render(): TemplateResult {
    if (this._is('error')) {
      return html`<x-error-screen></x-error-screen>`;
    }

    return html`
      <x-confirm-dialog
        message="delete_message"
        confirm="delete_yes"
        cancel="delete_no"
        header="delete"
        theme="primary error"
        lang=${this.lang}
        ns=${this.ns}
        id="confirm-delete"
        @submit=${() => this._delete()}
      >
      </x-confirm-dialog>

      <div class="relative">
        <div class="space-y-xl font-lumo text-body leading-m">
          <div class="space-y-l">
            <h2 class="text-xl font-medium">
              <x-i18n ns=${this.ns} lang=${this.lang} key="profile"></x-i18n>
            </h2>

            <div class="space-y-m">
              <vaadin-text-field
                class="w-full"
                label=${this._t('first_name').toString()}
                value=${this.resource?.first_name ?? ''}
                ?disabled=${!this.resource}
                @input=${(evt: CustomEvent<void>) => {
                  const target = evt.target as TextFieldElement;
                  this._setProperty({ ...this.resource!, first_name: target.value });
                }}
              >
              </vaadin-text-field>

              <vaadin-text-field
                class="w-full"
                label=${this._t('last_name').toString()}
                value=${this.resource?.last_name ?? ''}
                ?disabled=${!this.resource}
                @input=${(evt: CustomEvent<void>) => {
                  const target = evt.target as TextFieldElement;
                  this._setProperty({ ...this.resource!, last_name: target.value });
                }}
              >
              </vaadin-text-field>

              <vaadin-text-field
                class="w-full"
                label=${this._t('email').toString()}
                type="email"
                value=${this.resource?.email ?? ''}
                ?disabled=${!this.resource}
                @input=${(evt: CustomEvent<void>) => {
                  const target = evt.target as TextFieldElement;
                  this._setProperty({ ...this.resource!, email: target.value });
                }}
              >
              </vaadin-text-field>

              <vaadin-text-field
                class="w-full"
                label=${this._t('tax_id').toString()}
                value=${this.resource?.tax_id ?? ''}
                ?disabled=${!this.resource}
                @input=${(evt: CustomEvent<void>) => {
                  const target = evt.target as TextFieldElement;
                  this._setProperty({ ...this.resource!, tax_id: target.value });
                }}
              >
              </vaadin-text-field>
            </div>
          </div>

          <vaadin-button
            theme="primary error"
            class="w-full"
            ?disabled=${!this.resource}
            @click=${() => (this.__confirmDelete.open = true)}
          >
            <x-i18n ns=${this.ns} lang=${this.lang} key="delete"></x-i18n>
          </vaadin-button>

          <foxy-attributes
            lang=${this.lang}
            first=${ifDefined(this.resource?._links['fx:attributes'].href)}
          >
          </foxy-attributes>
        </div>

        <x-loading-screen
          class=${classMap({
            'transition duration-500 bg-base opacity-0 pointer-events-none': true,
            'opacity-100 pointer-events-all': this._is('busy'),
          })}
        >
        </x-loading-screen>
      </div>
    `;
  }

  private get __confirmDelete(): ConfirmDialog {
    return this.renderRoot.querySelector('#confirm-delete') as ConfirmDialog;
  }
}
