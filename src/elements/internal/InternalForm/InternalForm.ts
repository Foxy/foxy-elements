import type { HALJSONResource } from '../../public/NucleonElement/types';
import type { TemplateResult } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { ThemeableMixin } from '../../../mixins/themeable';
import { NucleonElement } from '../../public/NucleonElement/NucleonElement';
import { classMap } from '../../../utils/class-map';
import { html } from 'lit-html';

const Base = ConfigurableMixin(ThemeableMixin(TranslatableMixin(NucleonElement)));

export class InternalForm<TData extends HALJSONResource> extends Base<TData> {
  renderBody(): TemplateResult {
    return this.data
      ? html`
          <foxy-internal-timestamps-control infer="timestamps"></foxy-internal-timestamps-control>
          <foxy-internal-delete-control infer="delete"></foxy-internal-delete-control>
        `
      : html`<foxy-internal-create-control infer="create"></foxy-internal-create-control>`;
  }

  render(): TemplateResult {
    const isSpinnerVisible = !this.in('idle') && (!this.in({ busy: 'fetching' }) || !this.data);

    return html`
      <div aria-busy=${this.in('busy')} aria-live="polite" class="relative">
        <div
          class=${classMap({
            'grid grid-cols-1 gap-m': true,
            'transition-opacity': true,
            'opacity-0 pointer-events-none': isSpinnerVisible,
          })}
        >
          ${this.renderBody()}
        </div>

        <div
          class=${classMap({
            'transition-opacity absolute inset-0 flex': true,
            'opacity-0 pointer-events-none': !isSpinnerVisible,
          })}
        >
          <foxy-spinner
            layout=${this.in('fail') ? 'vertical' : 'no-label'}
            class="m-auto"
            state=${this.in('fail') ? 'error' : 'busy'}
            infer="spinner"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
