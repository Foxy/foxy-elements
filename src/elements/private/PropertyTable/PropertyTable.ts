import '@polymer/iron-icon';

import { TemplateResult, html } from 'lit-html';

import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { Translatable } from '../../../mixins/translatable';

interface PropertyTableItem {
  name: string;
  icon?: string;
  value: string;
}

export class PropertyTable extends Translatable {
  static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      items: { attribute: false },
    };
  }

  items: PropertyTableItem[] | null = null;

  render(): TemplateResult {
    return html`
      <table class="font-lumo text-body text-m leading-m w-full">
        <thead class="sr-only">
          <tr>
            <th>${this._t('property')}</th>
            <th>${this._t('value')}</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-contrast-10">
          ${this.items?.map(
            ({ name, icon, value }) => html`
              <tr>
                <td class="truncate text-secondary py-s pr-m">
                  <div class="flex items-center space-x-xs">
                    <span>${name}</span>
                    ${icon
                      ? html`<iron-icon icon=${icon} style="--iron-icon-width: 18px"></iron-icon>`
                      : ''}
                  </div>
                </td>

                <td class="truncate py-s pl-m w-full text-right md:text-left">${value}</td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}
