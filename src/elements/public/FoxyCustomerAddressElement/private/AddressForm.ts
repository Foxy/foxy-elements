import * as FoxySDK from '@foxy.io/sdk';

import { Checkbox, HypermediaResource, I18N, PropertyTable } from '../../../private';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { CheckboxChangeEvent } from '../../../private/events';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { classMap } from '../../../../utils/class-map';
import { memoize } from 'lodash-es';

type Address = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.CustomerAddress, undefined>;

export class AddressForm extends HypermediaResource<Address> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': TextFieldElement,
      'x-property-table': PropertyTable,
      'vaadin-button': ButtonElement,
      'x-checkbox': Checkbox,
      'x-i18n': I18N,
    };
  }

  readonly rel = 'customer_address';

  private __formLayout: (keyof Address | (keyof Address)[])[] = [
    ['first_name', 'last_name'],
    'company',
    'phone',
    'address1',
    'address2',
    ['country', 'region'],
    ['city', 'postal_code'],
  ];

  private __createInputHandler = memoize((key: keyof Address) => {
    return (evt: CustomEvent) => {
      const target = evt.target as TextFieldElement;
      this._update({ ...this.resource!, [key]: target.value });
    };
  });

  private __createChangeHandler = memoize((key: keyof Address) => {
    return (evt: CheckboxChangeEvent) => {
      const newValue = (evt.detail as unknown) as string; // TODO: fix once @foxy.io/sdk types are corrected
      this._update({ ...this.resource!, [key]: newValue });
    };
  });

  render(): TemplateResult {
    return html`
      <div class="space-y-l font-lumo text-m leading-m text-body">
        <div class="grid grid-cols-2 gap-m">
          ${this.__formLayout.map(fieldOrGroup =>
            typeof fieldOrGroup === 'string'
              ? this.__renderField(fieldOrGroup, true)
              : fieldOrGroup.map(field => this.__renderField(field))
          )}
        </div>

        <div class="space-y-s">
          ${(['is_default_billing', 'is_default_shipping'] as const).map(
            field => html`
              <x-checkbox
                ?checked=${!!this.resource?.[field]}
                @change=${this.__createChangeHandler(field)}
              >
                <x-i18n .ns=${this.ns} .lang=${this.lang} .key=${field}></x-i18n>
              </x-checkbox>
            `
          )}
        </div>

        ${this.resource
          ? html`
              <x-property-table .items=${this.__getPropertyTableItems(this.resource)}>
              </x-property-table>

              <vaadin-button theme="error primary" class="w-full">
                <x-i18n .ns=${this.ns} .lang=${this.lang} key="delete"></x-i18n>
              </vaadin-button>
            `
          : ''}
      </div>
    `;
  }

  private __getPropertyTableItems(resource: Address) {
    return (['date_modified', 'date_created'] as const).map(field => ({
      name: this._t(field),
      value: this.__formatDate(new Date(resource[field])),
    }));
  }

  private __renderField(field: keyof Address, wide = false) {
    return html`
      <vaadin-text-field
        class=${classMap({ 'col-span-2': wide })}
        label=${this._t(field).toString()}
        value=${this.resource?.[field] ?? ''}
        @input=${this.__createInputHandler(field)}
      >
      </vaadin-text-field>
    `;
  }

  private __formatDate(date: Date) {
    return date.toLocaleDateString(this.lang, {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    });
  }
}
