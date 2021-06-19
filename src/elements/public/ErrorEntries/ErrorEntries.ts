import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { html } from 'lit-html';
import { CSSResult, CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import { ErrorEntryCard } from '../ErrorEntryCard';
import { ButtonElement } from '@vaadin/vaadin-button';
import { TabsElement } from '@vaadin/vaadin-tabs/vaadin-tabs';
import { TabElement } from '@vaadin/vaadin-tabs/vaadin-tab';
import { Themeable } from '../../../mixins/themeable';
import { CollectionPage } from '../CollectionPage';
import { CollectionPages } from '../CollectionPages';

export class ErrorEntries extends Themeable {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      showHidden: {
        type: Boolean,
      },
      href: {
        type: String,
      },
    };
  }

  public static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-collection-page': CollectionPage,
      'foxy-collection-pages': CollectionPages,
      'foxy-error-entry': ErrorEntryCard,
      'foxy-i18n': customElements.get('foxy-i18n'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': ButtonElement,
      'vaadin-tab': TabElement,
      'vaadin-tabs': TabsElement,
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [Themeable.styles];
  }

  showHidden = false;

  href = '';

  private static __ns = 'error-entry';

  render(): TemplateResult {
    return html`
      <vaadin-tabs @selected-changed=${this.__handleSelectedChanged}>
        <vaadin-tab><foxy-i18n key="tab.new" ns="error-entry"></foxy-i18n></vaadin-tab>
        <vaadin-tab><foxy-i18n key="tab.all" ns="error-entry"></foxy-i18n></vaadin-tab>
      </vaadin-tabs>
      <div id="tabbed-content">
        <foxy-collection-pages
          first="${this.href}?offset=0${this.showHidden ? '' : `&hide_error=${this.showHidden}`}"
          page="foxy-collection-page foxy-error-entry-card"
        >
        </foxy-collection-pages>
      </div>
    `;
  }

  private __handleSelectedChanged(e: CustomEvent) {
    this.showHidden = e.detail.value === 1;
  }
}
