import { Group, Warning } from '../../private';
import { TemplateResult, html } from 'lit-element';

import { ConfigurableMixin } from '../../../mixins/configurable';
import { Data, Templates } from './types';
import { InternalCalendar } from '../../internal/InternalCalendar/InternalCalendar';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { serializeDate } from '../../../utils/serialize-date';

const NS = 'cancellation-form';
const Base = ScopedElementsMixin(
  ThemeableMixin(ConfigurableMixin(TranslatableMixin(NucleonElement, NS)))
);

/**
 * Form element for canceling subscriptions.
 *
 * @slot warning:before
 * @slot warning:after
 * @slot end-date:before
 * @slot end-date:after
 * @slot submit:before
 * @slot submit:after
 *
 * @element foxy-cancellation-form
 * @since 1.4.0
 */
export class CancellationForm extends Base<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'foxy-internal-calendar': customElements.get('foxy-internal-calendar'),
      'foxy-internal-sandbox': customElements.get('foxy-internal-sandbox'),
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-warning': Warning,
      'x-group': Group,
    };
  }

  static get v8n(): NucleonV8N<Data> {
    return [({ end_date: v }) => !!v || 'end_date_required'];
  }

  templates: Templates = {};

  private readonly __renderWarning = () => {
    const { lang, ns } = this;

    return html`
      <div>
        ${this._renderTemplateOrSlot('warning:before')}

        <x-warning>
          <foxy-i18n
            class=${classMap({ 'text-disabled': !this.in({ idle: 'snapshot' }) })}
            lang=${lang}
            key="end_subscription_explainer"
            ns=${ns}
          >
          </foxy-i18n>
        </x-warning>

        ${this._renderTemplateOrSlot('warning:after')}
      </div>
    `;
  };

  private readonly __renderEndDate = () => {
    const { constructor, lang, ns } = this;
    const tomorrow = (constructor as typeof CancellationForm).__tomorrow.getTime();
    const isIdleSnapshot = this.in({ idle: 'snapshot' });

    return html`
      <div>
        ${this._renderTemplateOrSlot('end-date:before')}

        <x-group frame>
          <foxy-i18n
            class=${classMap({ 'text-disabled': !isIdleSnapshot })}
            slot="header"
            lang=${lang}
            key="end_date"
            ns=${ns}
          >
          </foxy-i18n>

          <foxy-internal-calendar
            .checkAvailability=${(date: Date) => date.getTime() >= tomorrow}
            ?disabled=${!isIdleSnapshot || this.disabledSelector.matches('end-date', true)}
            ?readonly=${!!this.data?.end_date || this.readonlySelector.matches('end-date', true)}
            value=${ifDefined(this.form.end_date ?? undefined)}
            lang=${lang}
            @change=${(evt: CustomEvent<void>) => {
              this.edit({ end_date: (evt.target as InternalCalendar).value });
            }}
          >
          </foxy-internal-calendar>
        </x-group>

        ${this._renderTemplateOrSlot('end-date:after')}
      </div>
    `;
  };

  private readonly __renderSubmit = () => {
    const isValid =
      this.in({ idle: { snapshot: { clean: 'valid' } } }) ||
      this.in({ idle: { snapshot: { dirty: 'valid' } } });

    return html`
      <div>
        ${this._renderTemplateOrSlot('submit:before')}

        <vaadin-button
          ?disabled=${!isValid || this.disabledSelector.matches('submit', true)}
          theme="primary error"
          class="w-full"
          @click=${this.submit}
        >
          <foxy-i18n ns=${this.ns} lang=${this.lang} key="end_subscription"></foxy-i18n>
        </vaadin-button>

        ${this._renderTemplateOrSlot('submit:after')}
      </div>
    `;
  };

  render(): TemplateResult {
    const hiddenSelector = this.hiddenSelector;
    const isBusy = this.in('busy');

    return html`
      <div class="space-y-l font-lumo text-m text-body leading-m relative">
        ${hiddenSelector.matches('warning', true) ? '' : this.__renderWarning()}
        ${hiddenSelector.matches('end-date', true) ? '' : this.__renderEndDate()}
        ${hiddenSelector.matches('submit', true) ? '' : this.__renderSubmit()}

        <div
          class=${classMap({
            'transition duration-500 ease-in-out absolute inset-0 flex items-center justify-center':
              true,
            'opacity-0 pointer-events-none': !isBusy,
          })}
        >
          <foxy-spinner
            layout="vertical"
            class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
            state=${this.in('fail') ? 'error' : isBusy ? 'busy' : 'empty'}
            lang=${this.lang}
            ns=${this.ns}
          >
          </foxy-spinner>
        </div>
      </div>
    `;
  }

  submit(): void {
    if (!this.form.end_date) {
      const staticThis = this.constructor as typeof CancellationForm;
      this.edit({ end_date: serializeDate(staticThis.__tomorrow) });
    }

    super.submit();
  }

  private static get __tomorrow() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
