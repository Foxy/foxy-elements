import '@polymer/iron-icons';
import '@polymer/iron-icon';

import * as FoxySDK from '@foxy.io/sdk';

import { ErrorScreen, HypermediaResource, I18N, LoadingScreen } from '../../private';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { ConfirmDialog } from '../../private/Dialog/ConfirmDialog';
import { ElementResourceV8N } from '../../private/HypermediaResource/types';
import { FoxyAttributesElement } from '../FoxyAttributesElement';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { validate as isEmail } from 'email-validator';
import { memoize } from 'lodash-es';
import { spread } from '@open-wc/lit-helpers';

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
      'iron-icon': customElements.get('iron-icon'),
      'x-i18n': I18N,
    };
  }

  static get resourceV8N(): ElementResourceV8N<CustomerAddress> {
    return {
      first_name: [({ first_name: v }) => v.length <= 50 || 'error_too_long'],
      last_name: [({ last_name: v }) => v.length <= 50 || 'error_too_long'],
      tax_id: [({ tax_id: v }) => v.length <= 50 || 'error_too_long'],
      email: [
        ({ email: v }) => v.length > 0 || 'error_required',
        ({ email: v }) => v.length <= 100 || 'error_too_long',
        ({ email: v }) => isEmail(v) || 'error_invalid_email',
      ],
    };
  }

  readonly rel = 'customer';

  private __getInputHandler = memoize((key: keyof CustomerAddress) => {
    return (evt: CustomEvent<void>) => {
      const target = evt.target as TextFieldElement;
      this._setProperty({ [key]: target.value });
    };
  });

  private __handleFieldKeydown = (evt: KeyboardEvent) => {
    if (evt.key === 'Enter') this._submit();
  };

  constructor() {
    super('customer-form');
  }

  render(): TemplateResult {
    if (this._is('error') || this._is('idle.template')) {
      const type = this._is('error') ? 'unknown' : 'not_found';
      return html`<x-error-screen type=${type}></x-error-screen>`;
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

      <div class="relative font-lumo text-body leading-m">
        <div class="grid grid-cols-1 gap-xl">
          <div class="grid grid-cols-1 gap-l">
            <h2 class="text-xl font-medium flex justify-between items-center">
              <x-i18n ns=${this.ns} lang=${this.lang} key="profile"></x-i18n>
              <vaadin-button
                class=${classMap({
                  'px-xs rounded-full transition-opacity duration-500 ease-in-out': true,
                  'opacity-0': !this._is('idle.snapshot.modified'),
                })}
                ?disabled=${this._is('idle.snapshot.modified.invalid')}
                theme="primary success icon"
                @click=${this._submit}
              >
                <iron-icon icon="icons:done"></iron-icon>
              </vaadin-button>
            </h2>

            <div class="grid grid-cols-1 gap-m sm:grid-cols-2">
              <vaadin-text-field ...=${this.__bindToField('first_name')}></vaadin-text-field>
              <vaadin-text-field ...=${this.__bindToField('last_name')}></vaadin-text-field>
              <vaadin-text-field ...=${this.__bindToField('email')}></vaadin-text-field>
              <vaadin-text-field ...=${this.__bindToField('tax_id')}></vaadin-text-field>
            </div>
          </div>

          <vaadin-button
            theme="primary error"
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

  private __bindToField(key: keyof CustomerAddress) {
    const errorMessages = this._getErrorMessages();

    return spread({
      label: this._t(key).toString(),
      value: this.resource?.[key] ?? '',
      '?disabled': !this.resource,
      '?invalid': !!errorMessages[key],
      'error-message': errorMessages[key] ?? '',
      '@input': this.__getInputHandler(key),
      '@keydown': this.__handleFieldKeydown,
    });
  }
}
