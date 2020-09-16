import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@polymer/iron-icon';
import '@vaadin/vaadin-lumo-styles/icons';
import { css, CSSResultArray } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { Translatable } from '../../../../mixins/translatable';
import { I18N } from '../../../private';
import { SignIn } from '../../../private/SignIn/SignIn';

export class AdminSignIn extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-button': customElements.get('vaadin-button'),
      'iron-icon': customElements.get('iron-icon'),
      'x-sign-in': SignIn,
      'x-i18n': I18N,
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          height: 100%;
        }

        .max-w-22rem {
          max-width: 22rem;
        }
      `,
    ];
  }

  public render(): TemplateResult {
    return html`
      <div class="flex h-full overflow-auto bg-base">
        <x-sign-in class="m-auto p-l max-w-22rem" lang=${this.lang} ns="global"> </x-sign-in>
      </div>
    `;
  }
}
