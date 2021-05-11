import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data } from './types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';

const NS = 'attribute-card';
const Base = TranslatableMixin(ConfigurableMixin(ThemeableMixin(NucleonElement)), NS);

/**
 * Basic card displaying an attribute.
 *
 * Configurable controls **(new in v1.4.0)**:
 *
 * - `name`
 * - `value`
 *
 * @slot name:before - **new in v1.4.0**
 * @slot name:after - **new in v1.4.0**
 * @slot value:before - **new in v1.4.0**
 * @slot value:after - **new in v1.4.0**
 *
 * @element foxy-attribute-card
 * @since 1.2.0
 */
export class AttributeCard extends Base<Data> {
  private readonly __renderName = () => {
    const { data } = this;

    return html`
      <slot name="name:before"></slot>

      <div class="flex items-center space-x-xs text-xxs text-secondary">
        <div
          class="truncate uppercase font-medium  tracking-wider"
          title=${data?.name ?? ''}
          data-testid="name"
        >
          ${data?.name ?? html`&nbsp;`}
        </div>

        ${data && data.visibility !== 'public'
          ? html`<iron-icon icon="icons:lock" class="icon-inline"></iron-icon>`
          : ''}
      </div>

      <slot name="name:after"></slot>
    `;
  };

  private readonly __renderValue = () => {
    const { data } = this;

    return html`
      <slot name="value:before"></slot>
      <div class="truncate" title=${data?.value ?? ''} data-testid="value">
        ${data?.value ?? html`&nbsp;`}
      </div>
      <slot name="value:after"></slot>
    `;
  };

  render(): TemplateResult {
    const hiddenSelector = this.hiddenSelector;
    const isLoaded = this.in({ idle: 'snapshot' });
    const isEmpty = this.in({ idle: 'template' });

    return html`
      <div
        class="relative text-body text-l font-lumo leading-m focus-outline-none"
        aria-live="polite"
        aria-busy=${this.in('busy')}
      >
        ${hiddenSelector.matches('name', true) ? '' : this.__renderName()}
        ${hiddenSelector.matches('value', true) ? '' : this.__renderValue()}

        <div
          class=${classMap({
            'transition duration-250 ease-in-out absolute inset-0 flex items-center justify-center': true,
            'opacity-0 pointer-events-none': isLoaded,
          })}
        >
          <foxy-spinner
            state=${this.in('fail') ? 'error' : isEmpty ? 'empty' : 'busy'}
            lang=${this.lang}
            ns=${this.ns}
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
