import * as FoxySDK from '@foxy.io/sdk';

import {
  Choice,
  ErrorScreen,
  Group,
  HypermediaResource,
  I18N,
  LoadingScreen,
  PropertyTable,
} from '../../private';
import { TemplateResult, html } from 'lit-html';

import { ButtonElement } from '@vaadin/vaadin-button';
import { ChoiceChangeEvent } from '../../private/events';
import { ConfirmDialog } from '../../private/Dialog/ConfirmDialog';
import { ElementResourceV8N } from '../../private/HypermediaResource/types';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { TextAreaElement } from '@vaadin/vaadin-text-field/vaadin-text-area';
import { TextFieldElement } from '@vaadin/vaadin-text-field';

type Attribute = FoxySDK.Core.Resource<FoxySDK.Integration.Rels.Attribute, undefined>;

export class AttributeFormElement extends HypermediaResource<Attribute> {
  static readonly defaultNodeName = 'foxy-attribute-form';

  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-text-field': TextFieldElement,
      'vaadin-text-area': TextAreaElement,
      'x-property-table': PropertyTable,
      'x-confirm-dialog': ConfirmDialog,
      'x-loading-screen': LoadingScreen,
      'x-error-screen': ErrorScreen,
      'vaadin-button': ButtonElement,
      'x-choice': Choice,
      'x-group': Group,
      'x-i18n': I18N,
    };
  }

  static get resourceV8N(): ElementResourceV8N<Attribute> {
    return {
      name: [
        ({ name: v }) => (v && v.length > 0) || 'error_required',
        ({ name: v }) => (v && v.length <= 500) || 'error_too_long',
      ],
      value: [
        ({ value: v }) => (v && v.length > 0) || 'error_required',
        ({ value: v }) => (v && v.length <= 1000) || 'error_too_long',
      ],
    };
  }

  readonly rel = 'attribute';

  constructor() {
    super('attribute-form');
  }

  submit(): void {
    this._submit();
  }

  render(): TemplateResult {
    return html`
      <x-confirm-dialog
        message="delete_message"
        confirm="delete_yes"
        cancel="delete_no"
        header="delete"
        theme="primary error"
        lang=${this.lang}
        ns=${this.ns}
        id="confirm"
        @submit=${this._delete}
      >
      </x-confirm-dialog>

      <div class="relative grid grid-cols-1 gap-l">
        <vaadin-text-field
          label=${this._t('name').toString()}
          value=${this.resource?.name ?? ''}
          ?invalid=${this.errors.some(err => err.target === 'name')}
          ?disabled=${this._is('busy')}
          error-message=${this._getErrorMessages().name ?? ''}
          @keydown=${(evt: KeyboardEvent) => {
            if (evt.key === 'Enter') this._submit();
          }}
          @input=${(evt: InputEvent) => {
            const name = (evt.target as TextFieldElement).value;
            this._setProperty({ name });
          }}
        >
        </vaadin-text-field>

        <vaadin-text-area
          label=${this._t('value').toString()}
          value=${this.resource?.value ?? ''}
          ?invalid=${this.errors.some(err => err.target === 'value')}
          ?disabled=${this._is('busy')}
          error-message=${this._getErrorMessages().value ?? ''}
          @keydown=${(evt: KeyboardEvent) => {
            if (evt.key === 'Enter') this._submit();
          }}
          @input=${(evt: InputEvent) => {
            const value = (evt.target as TextAreaElement).value;
            this._setProperty({ value });
          }}
        >
        </vaadin-text-area>

        <x-group frame>
          <x-i18n ns=${this.ns} lang=${this.lang} key="visibility" slot="header"></x-i18n>

          <x-choice
            .items=${['private', 'restricted', 'public']}
            .value=${this.resource?.visibility ?? 'private'}
            .lang=${this.lang}
            .ns=${this.ns}
            ?disabled=${this._is('busy')}
            @change=${(evt: ChoiceChangeEvent) => {
              const visibility = evt.detail as 'private' | 'restricted' | 'public';
              this._setProperty({ visibility });
            }}
          >
            <x-i18n ns=${this.ns} lang=${this.lang} key="visibility_private" slot="private-label">
            </x-i18n>

            <x-i18n
              ns=${this.ns}
              lang=${this.lang}
              key="visibility_restricted"
              slot="restricted-label"
            >
            </x-i18n>

            <x-i18n ns=${this.ns} lang=${this.lang} key="visibility_public" slot="public-label">
            </x-i18n>
          </x-choice>
        </x-group>

        ${this._is('idle.snapshot')
          ? html`
              <x-property-table .items=${this.__getPropertyTableItems(this.resource!)}>
              </x-property-table>

              <vaadin-button
                theme="error primary"
                ?disabled=${this._is('busy')}
                @click=${() => this.__confirmDialog.show()}
              >
                <x-i18n ns=${this.ns} lang=${this.lang} key="delete"></x-i18n>
              </vaadin-button>
            `
          : ''}
        ${this._is('idle.template')
          ? html`
              <vaadin-button
                theme="success primary"
                ?disabled=${this._is('busy') || this._is('idle.template.invalid')}
                @click=${this._submit}
              >
                <x-i18n ns=${this.ns} lang=${this.lang} key="create"></x-i18n>
              </vaadin-button>
            `
          : ''}
        ${this._is('busy') ? html`<x-loading-screen class="bg-base"></x-loading-screen>` : ''}
        ${this._is('error') ? html`<x-error-screen class="bg-base"></x-error-screen>` : ''}
      </div>
    `;
  }

  private get __confirmDialog(): ConfirmDialog {
    return this.renderRoot.querySelector('#confirm') as ConfirmDialog;
  }

  private __getPropertyTableItems(resource: Attribute) {
    return (['date_modified', 'date_created'] as const).map(field => ({
      name: this._t(field),
      value: this.__formatDate(new Date(resource[field])),
    }));
  }

  private __formatDate(date: Date) {
    return date.toLocaleDateString(this.lang, {
      day: 'numeric',
      month: 'long',
      year: date.getFullYear() === new Date().getFullYear() ? undefined : 'numeric',
    });
  }
}
