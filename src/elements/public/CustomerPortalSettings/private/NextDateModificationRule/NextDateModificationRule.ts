import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { PropertyDeclarations, TemplateResult, html } from 'lit-element';
import { Translatable } from '../../../../../mixins/translatable';
import { classMap } from '../../../../../utils/class-map';
import { concatTruthy } from '../../../../../utils/concat-truthy';
import { parseDuration } from '../../../../../utils/parse-duration';
import { prevent } from '../../../../../utils/prevent';
import { translateDate } from '../../../../../utils/translate-date';
import { translateWeekday } from '../../../../../utils/translate-weekday';
import { Group, I18N, Warning } from '../../../../private/index';
import { AllowedDays } from '../AllowedDays/AllowedDays';
import { AllowedDaysChangeEvent } from '../AllowedDays/AllowedDaysChangeEvent';
import { DisallowedDates } from '../DisallowedDates/DisallowedDates';
import { DisallowedDatesChangeEvent } from '../DisallowedDates/DisallowedDatesChangeEvent';
import { JSONataInput } from '../JSONataInput/JSONataInput';
import { JSONataInputChangeEvent } from '../JSONataInput/JSONataInputChangeEvent';
import { OffsetInput } from '../OffsetInput/OffsetInput';
import { OffsetInputChangeEvent } from '../OffsetInput/OffsetInputChangeEvent';
import { NextDateModificationRuleChangeEvent } from './NextDateModificationRuleChangeEvent';
import { NextDateModificationRuleRemoveEvent } from './NextDateModificationRuleRemoveEvent';
import { Rule } from './Rule';

export class NextDateModificationRule extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'x-disallowed-dates': DisallowedDates,
      'x-jsonata-input': JSONataInput,
      'x-offset-input': OffsetInput,
      'x-allowed-days': AllowedDays,
      'iron-icon': customElements.get('iron-icon'),
      'x-warning': Warning,
      'x-group': Group,
      'x-i18n': I18N,
    };
  }

  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { type: Boolean },
      value: { type: Object },
      open: { type: Boolean },
    };
  }

  public disabled = false;

  public value: Rule = { jsonataQuery: '*' };

  public open = false;

  public constructor() {
    super('customer-portal-settings');
  }

  public render(): TemplateResult {
    const { min, max, allowedDays, jsonataQuery, disallowedDates } = this.value;
    const hasOffset = min || max;
    const hasAllowed = allowedDays && allowedDays.days.length > 0;
    const hasDisallowed = disallowedDates && disallowedDates.length > 0;
    const openStyle = this.open ? '' : 'rounded-b-l';

    return html`
      <x-group frame>
        <details
          data-testid="details"
          class=${classMap({ 'font-lumo': true, 'pointer-events-none': !this._isI18nReady })}
          ?open=${this.open}
          @toggle=${() => (this.open = !this.open)}
        >
          <summary
            class="${openStyle} cursor-pointer relative leading-s rounded-t-l focus-outline-none focus-shadow-outline"
          >
            <div class="p-m mr-xl text-m text-header font-medium space-y-s">
              <div>
                <x-i18n
                  .ns=${this.ns}
                  .lang=${this.lang}
                  key=${`ndmod.${jsonataQuery === '*' ? 'all' : 'some'}Title`}
                >
                  ${jsonataQuery !== '*' ? this.__renderJSONataSummary(jsonataQuery) : ''}
                </x-i18n>
              </div>

              ${hasOffset || hasAllowed || hasDisallowed
                ? html`
                    <div>
                      ${concatTruthy(
                        hasOffset && this.__renderMinMaxSummary(min, max),
                        hasAllowed && this.__renderAllowedSummary(allowedDays!),
                        hasDisallowed && this.__renderDisallowedSummary(disallowedDates!)
                      )}
                    </div>
                  `
                : ''}
            </div>

            <button
              data-testid="remove"
              .disabled=${this.disabled || !this._isI18nReady}
              class="flex items-center justify-center rounded absolute top-0 right-0 text-tertiary hover-text-secondary disabled-text-tertiary disabled-opacity-50 disabled-cursor-default focus-outline-none focus-shadow-outline"
              style="width: 54px; height: 54px"
              @click=${prevent(() => this.dispatchEvent(new NextDateModificationRuleRemoveEvent()))}
            >
              <iron-icon icon="lumo:cross"></iron-icon>
            </button>
          </summary>

          <article class="space-y-l">
            <x-group>
              <x-i18n slot="header" .ns=${this.ns} .lang=${this.lang} key="ndmod.match"> </x-i18n>

              <x-jsonata-input
                data-testid="jsonata"
                .ns=${this.ns}
                .lang=${this.lang}
                .value=${jsonataQuery}
                .disabled=${this.disabled || !this._isI18nReady}
                @change=${(evt: JSONataInputChangeEvent) => {
                  this.value = { ...this.value, jsonataQuery: evt.detail as string };
                  this.__sendUpdate();
                }}
              >
              </x-jsonata-input>
            </x-group>

            <div class="flex space-y-l md-space-y-0 flex-col md-flex-row">
              <div class="md-w-1-2 md-border-r md-border-contrast-10">
                <x-offset-input
                  data-testid="min"
                  type="min"
                  .lang=${this.lang}
                  .value=${min}
                  .disabled=${this.disabled || !this._isI18nReady}
                  @change=${(evt: OffsetInputChangeEvent) => {
                    this.value = { ...this.value, min: evt.detail };
                    this.__sendUpdate();
                  }}
                >
                </x-offset-input>
              </div>

              <div class="md-w-1-2">
                <x-offset-input
                  data-testid="max"
                  type="max"
                  .lang=${this.lang}
                  .value=${max}
                  .disabled=${this.disabled || !this._isI18nReady}
                  @change=${(evt: OffsetInputChangeEvent) => {
                    this.value = { ...this.value, max: evt.detail };
                    this.__sendUpdate();
                  }}
                >
                </x-offset-input>
              </div>
            </div>

            ${this.__compareDurations(min, max) === -1
              ? html`
                  <x-warning class="mx-m" data-testid="warning">
                    <x-i18n .ns=${this.ns} .lang=${this.lang} key="ndmod.minWarning"> </x-i18n>
                  </x-warning>
                `
              : ''}

            <x-group>
              <x-i18n slot="header" .ns=${this.ns} .lang=${this.lang} key="ndmod.allowed"> </x-i18n>

              <x-allowed-days
                data-testid="allowed"
                .lang=${this.lang}
                .value=${allowedDays}
                .disabled=${this.disabled || !this._isI18nReady}
                @change=${(evt: AllowedDaysChangeEvent) => {
                  this.value = { ...this.value, allowedDays: evt.detail };
                  this.__sendUpdate();
                }}
              >
              </x-allowed-days>
            </x-group>

            <x-group>
              <x-i18n slot="header" .ns=${this.ns} .lang=${this.lang} key="ndmod.excluded">
              </x-i18n>

              <x-disallowed-dates
                data-testid="disallowed"
                .ns=${this.ns}
                .lang=${this.lang}
                .value=${disallowedDates ?? []}
                .disabled=${this.disabled || !this._isI18nReady}
                @change=${(evt: DisallowedDatesChangeEvent) => {
                  this.value = { ...this.value, disallowedDates: evt.detail };
                  this.__sendUpdate();
                }}
              >
              </x-disallowed-dates>
            </x-group>
          </article>
        </details>
      </x-group>
    `;
  }

  private __sendUpdate() {
    this.dispatchEvent(new NextDateModificationRuleChangeEvent(this.value));
  }

  private __getEstimatedDaysFrom(duration: string) {
    const { count, units } = parseDuration(duration);
    const multipliers = { y: 365, m: 31, w: 7, d: 1 };

    return count * multipliers[units as 'y' | 'm' | 'w' | 'd'];
  }

  private __compareDurations(a: string | undefined, b: string | undefined) {
    if (a === b) return 0;
    if (!a || !b) return 1;
    if (this.__getEstimatedDaysFrom(a) < this.__getEstimatedDaysFrom(b)) return 1;
    return -1;
  }

  private __renderJSONataSummary(content: string) {
    return html`
      <code class="inline-block rounded bg-success-10 text-success px-xs text-xs leading-s">
        ${content}
      </code>
    `;
  }

  private __renderMinMaxContent(result?: ReturnType<typeof parseDuration>) {
    if (result) {
      const { count, units } = result;
      return html`
        ${count}
        <x-i18n .ns=${this.ns} .lang=${this.lang} key=${units} .opts=${{ count }}></x-i18n>
      `;
    } else {
      return html`<x-i18n .ns=${this.ns} .lang=${this.lang} key="ndmod.any"></x-i18n>`;
    }
  }

  private __renderMinMaxSummary(min?: string, max?: string) {
    return html`
      <div class="text-s text-tertiary font-normal">
        <x-i18n .ns=${this.ns} .lang=${this.lang} key="ndmod.range">
          <span>:</span>
          <span class="text-secondary">
            ${this.__renderMinMaxContent(min ? parseDuration(min) : undefined)} &mdash;
            ${this.__renderMinMaxContent(max ? parseDuration(max) : undefined)}
          </span>
        </x-i18n>
      </div>
    `;
  }

  private __renderAllowedSummary({ type, days }: Required<Rule>['allowedDays']) {
    return html`
      <div class="text-s text-tertiary font-normal">
        <x-i18n .ns=${this.ns} .lang=${this.lang} key="ndmod.allowed">
          <span>:</span>
          <span class="text-secondary">
            ${type === 'month' ? days.join(', ') : ''}
            ${type === 'day'
              ? days.map(day => translateWeekday(day, this.lang, 'short')).join(', ')
              : ''}
          </span>
        </x-i18n>
      </div>
    `;
  }

  private __renderDisallowedSummary(dates: string[]) {
    return html`
      <div class="text-s text-tertiary font-normal">
        <x-i18n .ns=${this.ns} .lang=${this.lang} key="ndmod.excluded">
          <span>:</span>
          <span class="text-secondary">
            ${dates.map(date => translateDate(date, this.lang)).join('; ')}
          </span>
        </x-i18n>
      </div>
    `;
  }
}
