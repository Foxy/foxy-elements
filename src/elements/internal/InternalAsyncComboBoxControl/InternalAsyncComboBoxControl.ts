import type { ComboBoxDataProvider, ComboBoxElement, ComboBoxItem } from '@vaadin/vaadin-combo-box';
import type { TemplateResult } from 'lit-html';

import { PropertyDeclarations } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';
import { html } from 'lit-html';

import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { API } from '../../public/NucleonElement/API';

/**
 * Internal control displaying a combo box where items are loaded from
 * a hAPI collection.
 *
 * @since 1.17.0
 * @element foxy-internal-async-combo-box-control
 */
export class InternalAsyncComboBoxControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      itemLabelPath: { type: String, attribute: 'item-label-path' },
      itemValuePath: { type: String, attribute: 'item-value-path' },
      selectedItem: { attribute: false },
      first: { type: String },
    };
  }

  /** Same as `itemLabelPath` property of Vaadin's `ComboBoxElement`. */
  itemLabelPath: string | null = null;

  /** Same as `itemValuePath` property of Vaadin's `ComboBoxElement`. */
  itemValuePath: string | null = null;

  selectedItem: ComboBoxItem | string | undefined = undefined;

  /** URL of the first page of the hAPI collection serving as a source for items. */
  first: string | null = null;

  renderControl(): TemplateResult {
    const dataProvider: ComboBoxDataProvider = async (params, callback) => {
      if (!this.first) return callback([], 0);

      const url = new URL(this.first);
      url.searchParams.set('offset', String(params.page * params.pageSize));
      url.searchParams.set('limit', String(params.pageSize));

      if (params.filter && this.itemLabelPath) {
        url.searchParams.set(this.itemLabelPath, `*${params.filter}*`);
      }

      const response = await new API(this).fetch(url.toString());
      if (!response.ok) throw new Error(await response.text());

      const json = await response.json();
      const items = Array.from(Object.values(json._embedded))[0] as unknown[];

      callback(items, json.total_items);
    };

    return html`
      <vaadin-combo-box
        item-value-path=${ifDefined(this.itemValuePath ?? undefined)}
        item-label-path=${ifDefined(this.itemLabelPath ?? undefined)}
        error-message=${ifDefined(this._errorMessage)}
        item-id-path="_links.self.href"
        helper-text=${this.helperText}
        placeholder=${this.placeholder}
        label=${this.label}
        class="w-full"
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        .checkValidity=${this._checkValidity}
        .dataProvider=${dataProvider}
        .selectedItem=${this.selectedItem}
        .value=${this._value}
        @change=${(evt: CustomEvent) => {
          const comboBox = evt.currentTarget as ComboBoxElement;
          this._value = comboBox.value;

          if (this._value === comboBox.value) {
            this.selectedItem = comboBox.selectedItem;
            this.dispatchEvent(new CustomEvent('selected-item-changed'));
          } else {
            comboBox.value = this._value;
          }
        }}
      >
      </vaadin-combo-box>
    `;
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);

    if (changes.has('first')) {
      const comboBox = this.renderRoot.querySelector('vaadin-combo-box') as ComboBoxElement;

      // this forces reload
      comboBox.size = 0;
      comboBox.size = 1;
    }
  }

  protected get _value(): string {
    return (super._value as string | undefined) ?? '';
  }

  protected set _value(newValue: string) {
    super._value = newValue as unknown | undefined;
  }
}
