import { ScopedElementsMap, ScopedElementsMixin } from '@open-wc/scoped-elements';

import { DataList } from './DataList';
import { NucleonElement } from '../NucleonElement/index';
import { getResourceId, Resource } from '@foxy.io/sdk/core';
import { TemplateResult } from 'lit-element';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { html } from 'lit-html';

type Rel = {
  links: { self: Rel };
  zooms: Record<string, any>;
  props: Record<string, unknown>;
};

const Base = TranslatableMixin(ThemeableMixin(ScopedElementsMixin(NucleonElement)));

export class ResourceViewer extends Base<Resource<Rel>> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-spinner': customElements.get('foxy-spinner'),
      'x-data-list': DataList,
    };
  }

  render(): TemplateResult {
    if (this.in({ idle: 'snapshot' })) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _links, _embedded, ...data } = this.data;

      try {
        const id = getResourceId(_links.self.href);
        if (id !== null) data.id = id;
      } catch {
        // ignore
      }

      return html`
        <x-data-list
          aria-live="polite"
          aria-busy="false"
          class="leading-s text-s"
          data=${JSON.stringify(Array.from(Object.entries(data)))}
        >
        </x-data-list>
      `;
    }

    const isBusy = this.in('busy');

    return html`
      <div aria-live="polite" aria-busy=${isBusy} data-testid="wrapper" class="flex justify-center">
        <foxy-spinner
          data-testid="spinner"
          layout="horizontal"
          state=${this.in('fail') ? 'error' : isBusy ? 'busy' : 'empty'}
          lang=${this.lang}
          ns=${this.ns}
        >
        </foxy-spinner>
      </div>
    `;
  }
}
