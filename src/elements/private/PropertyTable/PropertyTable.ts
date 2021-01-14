import '@polymer/iron-icon';

import { TemplateResult, html } from 'lit-html';

import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { Skeleton } from '../Skeleton/Skeleton';
import { Translatable } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

interface PropertyTableItem {
  name: string;
  value: string;
  invalid?: boolean;
  editable?: boolean;
  onInput?: (value: string) => void;
}

export class PropertyTable extends Translatable {
  static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
      'x-skeleton': Skeleton,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      items: { attribute: false },
    };
  }

  disabled = false;

  items: PropertyTableItem[] | null = null;

  render(): TemplateResult {
    return html`
      <table
        class=${classMap({
          'font-lumo text-body text-m leading-m w-full': true,
          'text-disabled': this.disabled,
          'text-body': !this.disabled,
        })}
      >
        <thead class="sr-only">
          <tr>
            <th>${this._t('property')}</th>
            <th>${this._t('value')}</th>
          </tr>
        </thead>

        <tbody class="divide-y divide-contrast-10">
          ${this.items?.map(
            ({ name, value, invalid, editable, onInput }) => html`
              <tr>
                <td
                  class=${classMap({
                    'truncate py-s pr-m': true,
                    'text-tertiary': !this.disabled,
                  })}
                >
                  <div class="flex items-center space-x-xs">
                    ${this._isI18nReady
                      ? html`<span>${name}</span>`
                      : html`<x-skeleton></x-skeleton>`}
                  </div>
                </td>

                <td class="py-s w-full">
                  ${editable
                    ? html`
                        <input
                          value=${value}
                          ?disabled=${this.disabled}
                          class=${classMap({
                            'w-full px-s rounded focus:outline-none': true,
                            'hover:bg-contrast-10 focus:bg-contrast-10 focus:shadow-outline': !invalid,
                            'text-error hover:bg-error-10 focus:bg-error-10 focus:shadow-outline-error': !!invalid,
                          })}
                          @keydown=${(evt: KeyboardEvent) => {
                            if (evt.key === 'Enter') this.dispatchEvent(new CustomEvent('submit'));
                          }}
                          @input=${(evt: InputEvent) => {
                            const target = evt.target as HTMLInputElement;
                            onInput?.(target.value);
                          }}
                        />
                      `
                    : html`<span class="px-s">${value}</span>`}
                </td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}
