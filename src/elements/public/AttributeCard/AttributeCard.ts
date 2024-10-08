import { Data } from './types';
import { TemplateResult, html } from 'lit-html';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ResponsiveMixin } from '../../../mixins/responsive';

const NS = 'attribute-card';
const Base = ResponsiveMixin(
  TranslatableMixin(ConfigurableMixin(ThemeableMixin(NucleonElement)), NS)
);

/**
 * Basic card displaying an attribute.
 *
 * @element foxy-attribute-card
 * @since 1.2.0
 */
export class AttributeCard extends Base<Data> {
  private readonly __renderName = () => {
    const { data } = this;

    return html`
      <div>
        ${this.renderTemplateOrSlot('name:before')}

        <div class="flex items-center space-x-xs font-medium">
          <div class="truncate" title=${data?.name ?? ''} data-testid="name">
            ${data?.name ?? html`&nbsp;`}
          </div>

          ${data && data.visibility !== 'public'
            ? html`
                <div class="flex items-center" style="height: 1px">
                  <iron-icon icon="icons:lock" class="icon-inline"></iron-icon>
                </div>
              `
            : ''}
        </div>

        ${this.renderTemplateOrSlot('name:after')}
      </div>
    `;
  };

  private readonly __renderValue = () => {
    const { data } = this;

    return html`
      <div>
        ${this.renderTemplateOrSlot('value:before')}

        <div
          class="truncate text-secondary text-s sm-text-m"
          title=${data?.value ?? ''}
          data-testid="value"
        >
          ${data?.value ?? html`&nbsp;`}
        </div>

        ${this.renderTemplateOrSlot('value:after')}
      </div>
    `;
  };

  render(): TemplateResult {
    const hiddenSelector = this.hiddenSelector;
    const isLoaded = this.in({ idle: 'snapshot' });
    const isEmpty = this.in({ idle: 'template' });

    return html`
      <div
        aria-live="polite"
        aria-busy=${this.in('busy')}
        class="relative text-body text-m font-lumo leading-xs sm-flex sm-items-center sm-justify-between"
      >
        ${hiddenSelector.matches('name', true) ? '' : this.__renderName()}
        ${hiddenSelector.matches('value', true) ? '' : this.__renderValue()}

        <div
          class=${classMap({
            'transition duration-250 ease-in-out absolute inset-0 flex': true,
            'items-center justify-center': true,
            'opacity-0 pointer-events-none': isLoaded,
          })}
        >
          <foxy-spinner
            data-testid="spinner"
            state=${this.in('fail') ? 'error' : isEmpty ? 'empty' : 'busy'}
            lang=${this.lang}
            ns="${this.ns} spinner"
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }
}
