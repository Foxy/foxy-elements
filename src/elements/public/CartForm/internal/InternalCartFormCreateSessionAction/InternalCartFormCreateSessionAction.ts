import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';
import type { CartForm } from '../../CartForm';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { classMap } from '../../../../../utils/class-map';
import { html } from 'lit-html';

type Loader = {
  result: string | null;
  state: 'idle' | 'busy' | 'fail';
  href: string;
};

export class InternalCartFormCreateSessionAction extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __loader: { attribute: false },
    };
  }

  private __loader: Loader | null = null;

  renderControl(): TemplateResult {
    const state = this.__loader?.state;
    const href = this.__loader?.result;

    if (href) {
      return html`
        <a
          target="_blank"
          class="rounded font-medium transition-colors text-body focus-outline-none focus-ring-2 focus-ring-primary-50"
          href=${href}
        >
          <foxy-i18n infer="" key="state_idle"></foxy-i18n>
        </a>
      `;
    } else {
      return html`
        <div
          class=${classMap({
            'transition-colors font-medium rounded': true,
            'text-tertiary': state !== 'fail',
            'text-error': state === 'fail',
          })}
        >
          <foxy-i18n infer="" key=${state === 'fail' ? 'state_fail' : 'state_busy'}> </foxy-i18n>
        </div>
      `;
    }
  }

  updated(changes: Map<keyof this, unknown>): void {
    super.updated(changes);

    const nucleon = this.nucleon as CartForm | null;
    const data = nucleon?.data;
    const newCreateSessionHref = data?._links['fx:create_session'].href ?? null;

    this.__reloadSessionHref(newCreateSessionHref);
  }

  private async __reloadSessionHref(href: string | null) {
    console.log('RELOAD SESSION HREF', href);
    if (this.__loader?.href === href) return;

    const nucleon = this.nucleon as CartForm | null;
    if (!nucleon) return;

    if (href) {
      const loader: Loader = { result: null, state: 'busy', href };
      const api = new (nucleon.constructor as typeof CartForm).API(this);

      this.__loader = loader;

      try {
        const response = await api.fetch(href, { method: 'POST' });
        if (!response.ok) throw new Error();

        loader.result = (await response.json()).cart_link;
        loader.state = 'idle';
      } catch {
        loader.state = 'fail';
      } finally {
        this.requestUpdate();
      }
    } else {
      this.__loader = null;
    }
  }
}
