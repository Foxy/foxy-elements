import type * as FoxySDK from '@foxy.io/sdk';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { NucleonElement } from '../../NucleonElement';
import { html } from 'lit-html';
import { css, CSSResult, CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import { ErrorEntry } from './ErrorEntry';
import { CheckboxElement } from '@vaadin/vaadin-checkbox';
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
      entries: {
        type: Object
      }
    };
  }

  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-error-entry': ErrorEntry,
      'foxy-spinner': customElements.get('foxy-spinner'),
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-checkbox': CheckboxElement,
      'vaadin-button': ButtonElement,
    }
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
      css`
        .fadeout {
          animation-duration: 0.2s;
          animation-name: out;
          animation-fill-mode: forwards;
          animation-timing-function: ease-in;
        }
        @keyframes out {
          0% {
            transform: translateX(0);
            max-height: 120px;
            opacity: 1;
          }
          99% {
            transform: translateX(-55px);
            max-height: 40px;
            opacity: 0;
            position: relative;
          }
          to {
            left: -100vw;
            position: absolute;
          }
        }
      `
    ];
  }

  showHidden = false;
  entries: Record<string, boolean> = {}

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
              ><iron-icon icon="icons:archive"> Hide archived</iron-icon>
              </vaadin-button>
            `
            : html`
              <vaadin-button
                class="px-s rounded text-tertiary"
                theme="icon"
                title="Show archived errors"
                @click=${this.__handleToggleShowHidden}
              ><iron-icon icon="icons:archive"> Show archived</iron-icon>
              </vaadin-button>
            `
          }
        </form>
        <form aria-busy=${this.in('busy')} aria-live='polite' >
          ${this.data?._embedded['fx:error_entries'].map(i => {
            return html`
              <div class='${ (this.entries[i._links.self.href] && !this.showHidden) ? 'fadeout': ''} flex flex-auto content-center w-full ${i.hide_error ? 'text-tertiary': ''}'>
                <vaadin-checkbox
                  title="Hide this error"
                  class="pt-s"
                  value='${i._links.self.href}'
                  ?checked=${i.hide_error}
                  @change=${this.__handleCheckErrorEntry}
                ></vaadin-checkbox>
                <foxy-error-entry
                  class="w-full"
                  href="${i._links.self.href}"
                  @update=${this.__handleUpdateErrorEntry}
                ></foxy-error-entry>
              </div>
            `
          })}
        </form>`;
    }
  }

  private __handleCheckErrorEntry(event: {target: ErrorEntry}) {
    const errorEntryElement = event.target.nextElementSibling as ErrorEntry;
    if (errorEntryElement) {
      (errorEntryElement).edit({
        ...errorEntryElement.data,
        ...{ hide_error: !errorEntryElement.form?.hide_error }
      });
      errorEntryElement.submit();
    }
  }

  private __handleToggleShowHidden() {
    this.showHidden = !this.showHidden;
  }


  private __handleUpdateErrorEntry(event: {target: ErrorEntry}) {
    try {
      const data = event.target.data as any;
      const id: string = event.target.href;
      const hide = !!data?.hide_error;
      const newEntries = {...this.entries};
      newEntries[id] = hide;
      this.entries = newEntries;
    } catch(e) {
      console.log("Could not update the error entry");
    }
  }

}


