import type { HALJSONResource as Data } from '../../public/NucleonElement/types';
import type { TemplateResult } from 'lit-html';

import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

export class InternalCard<TData extends Data> extends ThemeableMixin(NucleonElement)<TData> {
  renderBody(): TemplateResult {
    return html``;
  }

  render(): TemplateResult {
    return html`
      <div aria-busy=${this.in('busy')} aria-live="polite" class="relative">
        <div
          class=${classMap({
            'transition duration-500 ease-in-out': true,
            'opacity-0 pointer-events-none': !this.in({ idle: 'snapshot' }),
          })}
        >
          ${this.renderBody()}
        </div>

        <div
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': this.in({ idle: 'snapshot' }),
          })}
        >
          <foxy-spinner
            layout=${this.in('busy') ? 'no-label' : 'horizontal'}
            state=${this.in('fail') ? 'error' : this.in({ idle: 'template' }) ? 'empty' : 'busy'}
            class="m-auto"
            infer="spinner"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
