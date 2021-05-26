import type * as FoxySDK from '@foxy.io/sdk';
import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';
import { NucleonElement } from '../NucleonElement';
import { html } from 'lit-html';
import { CSSResult, CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import { ErrorEntryCard } from '../ErrorEntryCard';
import { ButtonElement } from '@vaadin/vaadin-button';
import { TabsElement } from '@vaadin/vaadin-tabs/vaadin-tabs';
import { TabElement } from '@vaadin/vaadin-tabs/vaadin-tab';
import { Themeable } from '../../../mixins/themeable';

type ErrorEntries = FoxySDK.Backend.Rels.ErrorEntries;
type Data = FoxySDK.Core.Resource<ErrorEntries>;

export class ErrorEntriesPage extends ScopedElementsMixin(NucleonElement)<Data> {

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
      'foxy-error-entry': ErrorEntryCard,
      'foxy-spinner': customElements.get('foxy-spinner'),
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': ButtonElement,
      'vaadin-tab': TabElement,
      'vaadin-tabs': TabsElement,
      'foxy-i18n': customElements.get('foxy-i18n'),
    }
  }

  static get styles(): CSSResult | CSSResultArray {
    return [
      Themeable.styles,
    ];
  }

  showHidden = false;

  private static __ns = 'error-entry';

  render(): TemplateResult {
    if (this.in({ idle: 'template' }) || !this.in('idle')) {
      const spinnerState = this.in('fail') ? 'error' : this.in('busy') ? 'busy' : 'empty';
      return html`
        <div aria-live="polite" aria-busy=${this.in('busy')} data-testid="wrapper">
          <div class="inset-0 flex items-center justify-center p-m">
            <foxy-spinner
                state=${spinnerState}
                data-testid="spinner"
                layout='horizontal'>
            </foxy-spinner>
          </div>
        </div>
      `;
    } else {
      return html`
        <vaadin-tabs>
          <vaadin-tab><foxy-i18n lang=${this.lang} key='newErrors'></foxy-i18n>new errors</vaadin-tab>
          <vaadin-tab><foxy-i18n lang=${this.lang} key='allErrors'></foxy-i18n>all errors</vaadin-tab>
        </vaadin-tabs>
        <div aria-busy=${this.in('busy')} aria-live='polite' class='${this.showHidden ? 'show': ''}' >
          ${this.data?._embedded['fx:error_entries'].map(i => {
            return html`
                <foxy-error-entry
                  class="w-full"
                  href="${i._links.self.href}"
                  .nohide=${this.showHidden}
                ></foxy-error-entry>
            `
          })}
        </div>`;
          }
    }

  private __handleToggleShowHidden() {
    this.showHidden = !this.showHidden;
  }

}


