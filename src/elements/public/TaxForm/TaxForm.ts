import { Checkbox, PropertyTable } from '../../private';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { Data } from './types';
import { NucleonElement } from '../NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { TemplateResult } from 'lit-element';
import { TextFieldElement } from '@vaadin/vaadin-text-field';
import { countries } from '../../../utils/countries';
import { html } from 'lit-html';
import { regions } from '../../../utils/regions';
import { taxProviders } from './providers';

export class TaxForm extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'x-checkbox': Checkbox,
      'x-combo-box': ComboBoxElement,
      'x-property-table': PropertyTable,
      'x-text-field': TextFieldElement,
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ name: v }) => (v && v.length <= 30) || 'name_too_long',
      ({ type: v }) =>
        (v && ['global', 'country', 'region', 'local'].includes(v)) || 'type_unknown',
      ({ country: v }) => !v || !!v.match(/[A-Z]{2}/) || 'country_unknown',
      ({ region: v }) => !v || v.length <= 20 || 'region_too_long',
      ({ city: v }) => !v || v.length <= 20 || 'city_too_long',
      ({ city: c, type: t }) => (t == 'local' && c) || t != 'local' || 'city_too_long',
      ({ service_provider: v }) => !v || v == 'avalara' || 'unknown_provider',
      ({ rate: v }) => (v && v <= 100) || 'invalid_percentage',
    ];
  }

  render(): TemplateResult {
    return html`
      <x-text-field label="name"></x-text-field>
      <x-combo-box label="region" .items=${['global', 'country', 'region', 'local']}></x-combo-box>
      <x-combo-box label="country" .items=${countries}></x-combo-box>
      <x-combo-box label="region" .items=${regions}></x-combo-box>
      <x-text-field label="city"></x-text-field>
      <x-checkbox> is live </x-checkbox>
      <x-combo-box label="provider" .items=${taxProviders}></x-combo-box>
      <x-checkbox>apply to shipping</x-checkbox>
      <x-checkbox>use origin rates</x-checkbox>
      <x-checkbox>exempt customers with a tax id</x-checkbox>
      <x-text-field label="rate"></x-text-field>
      <x-property-table
        .items=${(['date_modified', 'date_created'] as const).map(field => ({
          name: field,
          value: this.data ? field : '',
        }))}
      >
      </x-property-table>
    `;
  }
}
