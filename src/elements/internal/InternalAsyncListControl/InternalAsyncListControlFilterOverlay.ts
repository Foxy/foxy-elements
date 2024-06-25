import type { Constructor } from 'lit-element';
import type { Option } from '../../public/QueryBuilder/types';

import { _PositionMixin } from '@vaadin/vaadin-overlay/src/vaadin-overlay-position-mixin';
import { OverlayElement } from '@vaadin/vaadin-overlay/src/vaadin-overlay';
import { html, render } from 'lit-html';
import { QueryBuilder } from '../../public';

declare class PositionMixinHost {
  positionTarget: HTMLElement | null;
}

const PositionMixin = _PositionMixin as (
  superClass: Constructor<OverlayElement>
) => Constructor<OverlayElement> & Constructor<PositionMixinHost>;

export class InternalAsyncListControlFilterOverlay extends PositionMixin(OverlayElement) {
  static get is(): string {
    return 'foxy-internal-async-list-control-filter-overlay';
  }

  renderer = (root: HTMLElement, _: unknown, model: unknown): void => {
    const litRoot = root.firstElementChild ?? document.createElement('div');
    if (!root.firstElementChild) root.appendChild(litRoot);

    const m = model as { options: Option[]; value: string; lang: string; ns: string };

    const result = html`
      <div
        style="display: grid; gap: var(--lumo-space-m); padding: var(--lumo-space-s); width: 22rem"
      >
        <foxy-query-builder
          lang=${m.lang}
          ns=${`${m.ns} query-builder`.trim()}
          .options=${m.options}
          .value=${m.value}
        >
        </foxy-query-builder>

        <div style="display: flex; justify-content: space-between">
          <vaadin-button
            theme="primary"
            style="margin: 0"
            @click=${() => {
              const queryBuilder = litRoot.querySelector('foxy-query-builder') as QueryBuilder;
              const detail = queryBuilder.value ?? '';
              this.dispatchEvent(new CustomEvent('search', { detail }));
            }}
          >
            <foxy-i18n lang=${m.lang} ns=${m.ns} key="search"></foxy-i18n>
          </vaadin-button>

          <vaadin-button
            theme="secondary contrast"
            style="margin: 0"
            @click=${() => this.dispatchEvent(new CustomEvent('search'))}
          >
            <foxy-i18n lang=${m.lang} ns=${m.ns} key="clear"></foxy-i18n>
          </vaadin-button>
        </div>
      </div>
    `;

    render(result, litRoot);
  };
}
