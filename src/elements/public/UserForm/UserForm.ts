import * as icons from './icons';
import memoize from 'lodash-es/memoize';
import {
  CSSResult,
  CSSResultArray,
  css,
  html,
  TemplateResult,
  PropertyDeclarations
} from 'lit-element';
import { ButtonElement } from '@vaadin/vaadin-button';
import { Checkbox } from '../../private/Checkbox/Checkbox';
import { Data } from './types';
import { NucleonElement } from '../NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { validate as isEmail } from 'email-validator';
import { Themeable } from '../../../mixins/themeable';
import { ifDefined } from 'lit-html/directives/if-defined';


export class UserForm extends ScopedElementsMixin(NucleonElement)<Data> {

  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-spinner': customElements.get('foxy-spinner'),
      'vaadin-button': ButtonElement,
      'vaadin-text-field': customElements.get('vaadin-text-field'),
      'x-user-role': UserRole,
      'foxy-i18n': customElements.get('foxy-i18n')
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  private static __ns = 'user-form';

  render(): TemplateResult {
    const ns = UserForm.__ns;
    if (!this.in('idle')) {
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
            <vaadin-text-field
              label='name.first'
              value="${ifDefined(this.form?.first_name?.toString())}"
              ></vaadin-text-field>
            <vaadin-text-field
              label='name.last'
              value="${ifDefined(this.form?.last_name?.toString())}"
              ></vaadin-text-field>
            <vaadin-text-field
              class="col-span2"
              label='email'
              value="${ifDefined(this.form?.email?.toString())}"
              ></vaadin-text-field>
            <vaadin-text-field
              class="col-span2"
              label='phone'
              value="${ifDefined(this.form?.phone?.toString())}"
              ></vaadin-text-field>
          </div>
        </div>
        <div class="my-s">
          <div><foxy-i18n class="text-secondary text-s" key="roles" ns="${ns}"></foxy-i18n></div>
          <div class="border rounded-l border-contrast-10 mb-s p-s">
          ${Object.keys(UserRole.roles).map(r => 
            html`
            <x-user-role name="${r}"></x-user-role>
            `
          )}
          </div>
        </div>
        <vaadin-button
            class="w-full"
            theme=${this.in('idle') ? `primary ${this.href ? 'error' : 'success'}` : ''}
            data-testid="action"
            >
            <foxy-i18n ns=${ns} key=${this.href ? 'delete' : 'create'} lang=${this.lang}></foxy-i18n>
        </vaadin-button>

        `;
    }
  }

  private get __roles() {
    if (!this.data) {
      return [];
    } else {
      return 
    }
  }

  private __handleConfirmHide(evt: CustomEvent) {
    if (!evt.detail.cancelled) this.delete();
  }

}

class UserRole extends Themeable {

  public static roles = {
    merchant: 
    {
      "name": "merchant.name",
      "description": "merchant.description",
      "icon": icons.merchant
    },
    programmer:
    {
      "name": "programmer.name",
      "description": "programmer.description",
      "icon": icons.backend
    },
    frontend:
    {
      "name": "frontend.name",
      "description": "frontend.description",
      "icon": icons.frontend
    },
    designer:
    {
      "name": "designer.name",
      "description": "designer.description",
      "icon": icons.designer
    },
  };

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      name: {
        type: String
      }
    }
  }

  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-checkbox': Checkbox,
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
      css`
        :host(:last-child) .border-b {
          border: none;
        }
        div[data-icon] {
          width: 18px;
          height: 18px;
        }
      `
    ]
  }

  public name: 'merchant'|'programmer'|'frontend'|'designer'|'' = '';

  render() {
    if (!this.name) {
      return html``;
    }
    const data = UserRole.roles[this.name];
    return html`
      <div data-user-form-role class="flex w-full py-s">
        <x-checkbox ></x-checkbox>
        <div class="flex-grow flex border-b border-contrast-10 p-0">
          <div class="flex-grow pb-s">
            <div class="text-header"><foxy-i18n ns="user-form" key="${data.name}"></foxy-i18n></div>
            <div class="text-s text-body"><foxy-i18n  ns="user-form" key="${data.description}"></foxy-i18n></div>
          </div>
          <div data-icon class="text-body">
            ${data.icon}
          </div>
        </div>
      </div>
    `
    ;
  }

}
