import { html, TemplateResult } from 'lit-html';
import { InternalEditableControl } from '../InternalEditableControl/InternalEditableControl';
import { ComboBoxDataProvider, ComboBoxElement } from '@vaadin/vaadin-combo-box';
import { API } from '../../public/NucleonElement/API';
import { PropertyDeclarations } from 'lit-element';
import { ifDefined } from 'lit-html/directives/if-defined';

export class InternalAsyncComboBoxControl extends InternalEditableControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      itemLabelPath: { type: String, attribute: 'item-label-path' },
      itemValuePath: { type: String, attribute: 'item-value-path' },
      first: { type: String },
    };
  }

  itemLabelPath = '';

  itemValuePath = '';

  first = '';

  renderControl(): TemplateResult {
    const dataProvider: ComboBoxDataProvider = async (params, callback) => {
      const url = new URL(this.first);

      url.searchParams.set('offset', String(params.page * params.pageSize));
      url.searchParams.set('limit', String(params.pageSize));
      if (params.filter) url.searchParams.set(this.itemLabelPath, `*${params.filter}*`);

      const response = await new API(this).fetch(url.toString());
      if (!response.ok) throw new Error(await response.text());

      const json = await response.json();
      const items = Array.from(Object.values(json._embedded))[0] as unknown[];

      callback(items, json.total_items);
    };

    return html`
      <vaadin-combo-box
        item-value-path=${this.itemValuePath}
        item-label-path=${this.itemLabelPath}
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
        .value=${this._value}
        @change=${(evt: CustomEvent) => {
          const comboBox = evt.currentTarget as ComboBoxElement;
          this._value = comboBox.value;
        }}
      >
      </vaadin-combo-box>
    `;
  }

  protected get _value(): string {
    return (super._value as string | undefined) ?? '';
  }

  protected set _value(newValue: string) {
    super._value = newValue as unknown | undefined;
  }
}
