import {
  CSSResult,
  CSSResultArray,
  html,
  TemplateResult
} from 'lit-element';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { NucleonElement } from '../NucleonElement';
import { Themeable } from '../../../mixins/themeable';
import { Data } from './types';
import { GridElement } from '@vaadin/vaadin-grid';
import { GridColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-column';
import { GridSelectionColumnElement } from '@vaadin/vaadin-grid/vaadin-grid-selection-column';


export class UserForm extends ScopedElementsMixin(NucleonElement)<Data> {

  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-spinner': customElements.get('foxy-spinner'),
      'vaadin-grid': GridElement,
      'vaadin-grid-column': GridColumnElement,
      'vaadin-grid-selection-column': GridSelectionColumnElement,
      'vaadin-text-field': customElements.get('vaadin-text-field'),
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  private static __ns = 'user';

  render(): TemplateResult {
    const ns = UserForm.__ns;
    if (!this.data) {
      return html`
        <div class="absolute inset-0 flex items-center justify-center">
          <foxy-spinner
              data-testid="spinner"
              class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
              layout="horizontal"
              state=${this.in('busy') ? 'busy' : 'error'}
              >
          </foxy-spinner>
        </div>
      `;
    } else {
      return html`
        <x-confirm-dialog
            message="delete_prompt"
            confirm="delete"
            cancel="cancel"
            header="delete"
            theme="primary error"
            lang=${this.lang}
            ns=${ns}
            id="confirm"
            data-testid="confirm"
            @hide=${this.__handleConfirmHide}
            >
        </x-confirm-dialog>
          <div class="space-y-l" data-testid="wrapper" aria-busy=${this.in('busy')} aria-live="polite">
            <div class="grid grid-cols-1 sm-grid-cols-2 gap-m" .items=${this.__roles} >
              <vaadin-text-field label='name.first' value="João"></vaadin-text-field>
              <vaadin-text-field label='name.last' value="João"></vaadin-text-field>
              <vaadin-text-field class="col-span2" label='email' value="João"></vaadin-text-field>
              <vaadin-text-field class="col-span2" label='phone' value="João"></vaadin-text-field>
            </div>
          </div>
          <vaadin-grid .items=${this.__roles} >
            <vaadin-grid-selection-column auto-select>
            </vaadin-grid-selection-column>
            <vaadin-grid-column path="name">
            </vaadin-grid-column>
            <vaadin-grid-column path="description">
            </vaadin-grid-column>
            <vaadin-grid-column path="icon">
            </vaadin-grid-column>
          </vaadin-grid>
        `;
    }
  }

  private get __roles() {
    if (!this.data) {
      return [];
    } else {
      return [
        {
          "name": "merchant.name",
          "description": "merchant.description",
          "icon": 'merchant.icon'
        },
        {
         "name": "programmer.name",
          "description": "programmer.description",
          "icon": 'programmer.icon'
        },
        {
          "name": "frontend.name",
          "description": "frontend.description",
          "icon": 'frontend.icon'
        },
        {
          "name": "designer.name",
          "description": "designer.description",
          "icon": 'designer.icon'
        },
      ]
    }
  }

  private __handleConfirmHide(evt: CustomEvent) {
    if (!evt.detail.cancelled) this.delete();
  }

}

