import type * as FoxySDK from '@foxy.io/sdk';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { NucleonElement } from '../../NucleonElement';
import { html } from 'lit-html';
import { CSSResult, CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import { ErrorEntry } from './ErrorEntry';
import { ButtonElement } from '@vaadin/vaadin-button';
import { Themeable } from '../../../../mixins/themeable';

type ErrorEntries = FoxySDK.Backend.Rels.ErrorEntries;
type Data = FoxySDK.Core.Resource<ErrorEntries>;

export class ErrorLog extends ScopedElementsMixin(NucleonElement)<Data> {

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      showHidden: {
        type: Boolean
      },
    };
  }

  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-error-entry': ErrorEntry,
      'foxy-spinner': customElements.get('foxy-spinner'),
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': ButtonElement,
    }
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
    ];
  }

  showHidden = false;

  render(): TemplateResult {
    if (this.in({ idle: 'template' }) || !this.in('idle')) {
      const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';
      return html`
        <div aria-live="polite" aria-busy=${this.in('busy')} data-testid="wrapper">
          <div class="inset-0 flex items-center justify-center p-m">
            <foxy-spinner state=${spinnerState} data-testid="spinner" layout='horizontal'></foxy-spinner>
          </div>
        </div>
      `;
    } else {
      return html`
        <form class='my-m text-tertiary'>
          ${this.showHidden
              ? html`
              <vaadin-button
                class="px-s rounded text-primary-contrast bg-primary"
                theme="icon"
                title="Hide archived errors"
                @click=${this.__handleToggleShowHidden}
              ><iron-icon icon="icons:archive"></iron-icon> Hide archived
              </vaadin-button>
            `
              : html`
              <vaadin-button
                class="px-s rounded text-tertiary"
                theme="icon"
                title="Show archived errors"
                @click=${this.__handleToggleShowHidden}
              ><iron-icon icon="icons:archive"></iron-icon> Show archived
              </vaadin-button>
            `
          }
        </form>
        <form aria-busy=${this.in('busy')} aria-live='polite' class='${this.showHidden ? 'show': ''}' >
          ${this.data?._embedded['fx:error_entries'].map(i => {
            return html`
                <foxy-error-entry
                  class="w-full"
                  href="${i._links.self.href}"
                  .nohide=${this.showHidden}
                ></foxy-error-entry>
            `
          })}
        </form>`;
          }
    }

  private __handleToggleShowHidden() {
    this.showHidden = !this.showHidden;
  }

}


