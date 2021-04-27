import { CSSResult, CSSResultArray, TemplateResult, html } from 'lit-element';
import { Group, Warning } from '../../private';

import { Calendar } from '../Calendar/Calendar';
import { Data } from './types';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { NucleonV8N } from '../NucleonElement/types';
import { ScopedElementsMap } from '@open-wc/scoped-elements/src/types';
import { ScopedElementsMixin } from '@open-wc/scoped-elements';
import { Themeable } from '../../../mixins/themeable';
import { classMap } from '../../../utils/class-map';
import { ifDefined } from 'lit-html/directives/if-defined';
import { serializeDate } from '../../../utils/serialize-date';

export class SubscriptionCancellationForm extends ScopedElementsMixin(NucleonElement)<Data> {
  static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-button': customElements.get('vaadin-button'),
      'foxy-calendar': customElements.get('foxy-calendar'),
      'foxy-spinner': customElements.get('foxy-spinner'),
      'foxy-i18n': customElements.get('foxy-i18n'),
      'x-warning': Warning,
      'x-group': Group,
    };
  }

  static get styles(): CSSResult | CSSResultArray {
    return Themeable.styles;
  }

  static get v8n(): NucleonV8N<Data> {
    return [({ end_date: v }) => !!v || 'end_date_required'];
  }

  private static __ns = 'subscription-cancellation-form';

  render(): TemplateResult {
    const staticThis = this.constructor as typeof SubscriptionCancellationForm;
    const tomorrow = staticThis.__tomorrow;
    const lang = this.lang;
    const ns = staticThis.__ns;

    const isCancelled = !!this.data?.end_date;
    const isIdleSnapshot = this.in({ idle: 'snapshot' });
    const isIdleSnapshotValid =
      this.in({ idle: { snapshot: { clean: 'valid' } } }) ||
      this.in({ idle: { snapshot: { dirty: 'valid' } } });

    return html`
      <div class="space-y-l font-lumo text-m text-body leading-m relative">
        ${!this.excluded.matches('explainer')
          ? html`
              <x-warning>
                <foxy-i18n
                  class=${classMap({ 'text-disabled': !isIdleSnapshot })}
                  lang=${lang}
                  key="end_subscription_explainer"
                  ns=${ns}
                >
                </foxy-i18n>
              </x-warning>
            `
          : ''}
        <!---->
        ${!this.excluded.matches('end-date')
          ? html`
              <x-group frame>
                <foxy-i18n
                  class=${classMap({ 'text-disabled': !isIdleSnapshot })}
                  slot="header"
                  lang=${lang}
                  key="end_date"
                  ns=${ns}
                >
                </foxy-i18n>

                <foxy-calendar
                  .checkAvailability=${(date: Date) => date.getTime() >= tomorrow.getTime()}
                  ?disabled=${!isIdleSnapshot || this.disabled.matches('end-date')}
                  ?readonly=${isCancelled || this.readonly.matches('end-date')}
                  value=${ifDefined(this.form.end_date ?? undefined)}
                  lang=${lang}
                  @change=${this.__handleEndDateChange}
                >
                </foxy-calendar>
              </x-group>
            `
          : ''}
        <!---->
        ${!this.excluded.matches('submit-button') && !isCancelled
          ? html`
              <vaadin-button
                ?disabled=${!isIdleSnapshotValid || this.disabled.matches('submit-button')}
                theme="primary error"
                class="w-full"
                @click=${this.submit}
              >
                <foxy-i18n ns=${ns} lang=${lang} key="end_subscription"></foxy-i18n>
              </vaadin-button>
            `
          : ''}
        <!---->
        ${!isIdleSnapshot
          ? html`
              <div class="absolute inset-0 flex items-center justify-center">
                <foxy-spinner
                  class="p-m bg-base shadow-xs rounded-t-l rounded-b-l"
                  state=${this.in('busy') ? 'busy' : 'error'}
                  layout="vertical"
                  data-testid="spinner"
                >
                </foxy-spinner>
              </div>
            `
          : ''}
      </div>
    `;
  }

  submit(): void {
    if (!this.form.end_date) {
      const staticThis = this.constructor as typeof SubscriptionCancellationForm;
      this.edit({ end_date: serializeDate(staticThis.__tomorrow) });
    }

    super.submit();
  }

  private __handleEndDateChange(evt: CustomEvent<void>) {
    this.edit({ end_date: (evt.target as Calendar).value });
  }

  private static get __tomorrow() {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    date.setHours(0, 0, 0, 0);
    return date;
  }
}
