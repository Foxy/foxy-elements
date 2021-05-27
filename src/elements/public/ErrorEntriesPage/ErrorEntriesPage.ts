import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { html } from 'lit-html';
import { CSSResult, CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import { ErrorEntryCard } from '../ErrorEntryCard';
import { ButtonElement } from '@vaadin/vaadin-button';
import { TabsElement } from '@vaadin/vaadin-tabs/vaadin-tabs';
import { TabElement } from '@vaadin/vaadin-tabs/vaadin-tab';
import { Themeable } from '../../../mixins/themeable';
import { CollectionPage } from '../CollectionPage';

export class ErrorEntriesPage extends Themeable {
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
      'foxy-error-entry': ErrorEntryCard,
      'foxy-spinner': customElements.get('foxy-spinner'),
      'iron-icon': customElements.get('iron-icon'),
      'vaadin-button': ButtonElement,
      'vaadin-tab': TabElement,
      'vaadin-tabs': TabsElement,
      'foxy-i18n': customElements.get('foxy-i18n'),
      'foxy-collection-page': CollectionPage,
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return [Themeable.styles];
  }

  showHidden = false;

  href = '';

  private static __ns = 'error-entry';

  private __searchParams = '?hide_error=false';

  render(): TemplateResult {
    return html`
      <vaadin-tabs @selected-changed=${this.__handleSelectedChanged}>
        <vaadin-tab><foxy-i18n key="tab.new" ns="error-entry"></foxy-i18n></vaadin-tab>
        <vaadin-tab><foxy-i18n key="tab.all" ns="error-entry"></foxy-i18n></vaadin-tab>
      </vaadin-tabs>
      <div id="tabbed-content">
        ${this.showHidden
          ? html`<foxy-collection-page
              href="${this.href}"
              item="foxy-error-entry-card"
            ></foxy-collection-page>`
          : html`<foxy-collection-page
              href="${this.href}?hide_error=${this.showHidden}"
              item="foxy-error-entry-card"
            ></foxy-collection-page>`}
      </div>
    `;
  }

  private __handleSelectedChanged(e: CustomEvent) {
    this.showHidden = e.detail.value === 1;
  }
}
