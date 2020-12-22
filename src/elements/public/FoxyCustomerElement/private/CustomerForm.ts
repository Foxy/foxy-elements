import * as FoxySDK from '@foxy.io/sdk';

import { HypermediaResource, I18N } from '../../../private';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { FoxyAttributesElement } from '../../FoxyAttributesElement';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { TextFieldElement } from '@vaadin/vaadin-text-field';

type Customer = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Customer, undefined>;

export class CustomerForm extends HypermediaResource<Customer> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': TextFieldElement,
      'foxy-attributes': customElements.get(FoxyAttributesElement.defaultNodeName),
      'vaadin-button': ButtonElement,
      'x-i18n': I18N,
    };
  }

  readonly rel = 'customer';

  render(): TemplateResult {
    return html`
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
                this._update({ ...this.resource!, first_name: target.value });
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
                this._update({ ...this.resource!, last_name: target.value });
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
                this._update({ ...this.resource!, email: target.value });
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
                this._update({ ...this.resource!, tax_id: target.value });
              }}
            >
            </vaadin-text-field>
          </div>
        </div>

        <vaadin-button theme="primary error" class="w-full">
          <x-i18n ns=${this.ns} lang=${this.lang} key="delete"></x-i18n>
        </vaadin-button>

        <foxy-attributes lang=${this.lang} first=${this.resource!._links['fx:attributes'].href}>
        </foxy-attributes>
      </div>
    `;
  }
}
