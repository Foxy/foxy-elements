import '@vaadin/vaadin-date-picker';
import { html } from 'lit-element';
import * as UI from '../../../layout/index';
import { translateWeekday } from '../utils/translate-weekday';
import { parseDuration } from '../utils/parse-duration';
import { NdmRuleWeekdayPicker } from './ndm-rule-weekday-picker';
import { NdmRuleDatePicker } from './ndm-rule-date-picker';
import { NdmRuleJsonata } from './ndm-rule-jsonata';
import { NdmRuleOffset } from './ndm-rule-offset';
import { TFunction } from 'i18next';

interface Rule {
  min?: string;
  max?: string;
  jsonataQuery: string;
  disallowedDates?: string[];
  allowedDays?: {
    type: 'day' | 'month';
    days: number[];
  };
}

interface NdmRuleParams {
  t: TFunction;
  rule: Rule;
  locale: string;
  modified: boolean;
  disabled: boolean;
  onChange: (value?: Rule) => void;
}

function getEstimatedDaysFrom(duration: string) {
  const { count, units } = parseDuration(duration);

  if (units === 'y') return count * 365;
  if (units === 'm') return count * 31;
  if (units === 'w') return count * 7;

  return count;
}

function compareDurations(a: string | undefined, b: string | undefined) {
  if (a === b) return 0;
  if (a === undefined || b === undefined) return 1;
  if (getEstimatedDaysFrom(a) < getEstimatedDaysFrom(b)) return 1;
  return -1;
}

export function NdmRule({
  t,
  rule,
  locale,
  modified,
  disabled,
  onChange,
}: NdmRuleParams) {
  const addDisallowedDate = (evt: InputEvent) => {
    const input = evt.target as HTMLInputElement;
    const dates = rule.disallowedDates ?? [];

    if (input.value.length > 0) {
      onChange({ ...rule, disallowedDates: [...dates, input.value] });
      setTimeout(() => (input.value = ''), 0);
    }
  };

  const parsedMin = rule.min ? parseDuration(rule.min) : undefined;
  const parsedMax = rule.max ? parseDuration(rule.max) : undefined;
  const comparisonResult = compareDurations(rule.min, rule.max);

  return UI.Frame(
    html`
      <details>
        <summary class="relative leading-s">
          <div class="p-m text-m text-header font-medium">
            ${t(`ndmod.${rule.jsonataQuery === '*' ? 'all' : 'some'}Title`)}
            ${UI.If(
              rule.jsonataQuery !== '*',
              () =>
                html`<code
                  class="inline-block rounded bg-success-10 text-success px-xs text-xs leading-s"
                  >${rule.jsonataQuery}</code
                >`
            )}
            ${UI.If(
              Boolean(rule.min) || Boolean(rule.max),
              () => html`
                <div class="text-s text-secondary font-normal">
                  <span class="text-tertiary">${t('ndmod.range')}:</span>
                  ${parsedMin
                    ? `${parsedMin.count} ${t(parsedMin.units, {
                        count: parsedMin.count,
                      })}`
                    : t('ndmod.any')}
                  &mdash;
                  ${parsedMax
                    ? `${parsedMax.count} ${t(parsedMax.units, {
                        count: parsedMax.count,
                      })}`
                    : t('ndmod.any')}
                </div>
              `
            )}
            ${UI.If(
              Boolean(rule.allowedDays) && rule.allowedDays!.days.length > 0,
              () => html`
                <div class="text-s text-secondary font-normal">
                  <span class="text-tertiary">${t('ndmod.allowed')}:</span>
                  ${UI.If(rule.allowedDays!.type === 'month', () =>
                    rule.allowedDays!.days.join(', ')
                  )}
                  ${UI.If(rule.allowedDays!.type === 'day', () =>
                    rule
                      .allowedDays!.days.map(day =>
                        translateWeekday(day, locale, 'short')
                      )
                      .join(', ')
                  )}
                </div>
              `
            )}
            ${UI.If(
              Boolean(rule.disallowedDates) && rule.disallowedDates!.length > 0,
              () => html`
                <div class="text-s text-secondary font-normal">
                  <span class="text-tertiary">${t('ndmod.excluded')}:</span>
                  ${rule
                    .disallowedDates!.map(date =>
                      new Date(date).toLocaleDateString(locale, {
                        year: '2-digit',
                        month: 'short',
                        day: 'numeric',
                      })
                    )
                    .join('; ')}
                </div>
              `
            )}
          </div>

          <button
            class="flex items-center justify-center absolute top-0 right-0 text-tertiary"
            style="width: 54px; height: 54px"
            @click=${(evt: MouseEvent) => [evt.preventDefault(), onChange()]}
          >
            <iron-icon icon="lumo:cross"></iron-icon>
          </button>
        </summary>

        ${UI.Section(
          UI.Group(
            html`<div class="px-m">${UI.Subheader(t('ndmod.match'))}</div>`,
            NdmRuleJsonata({ t, rule, disabled, onChange })
          ),

          UI.Group(
            html`
              <div class="flex space-y-m md:space-y-0 flex-col md:flex-row">
                <div class="md:w-1/2 md:border-r md:border-shade-10">
                  ${NdmRuleOffset({ t, rule, disabled, onChange, type: 'min' })}
                </div>
                <div class="md:w-1/2">
                  ${NdmRuleOffset({ t, rule, disabled, onChange, type: 'max' })}
                </div>
              </div>
            `,

            UI.If(
              modified && comparisonResult === -1,
              () =>
                html`<div class="px-m">
                  ${UI.Warning(t('ndmod.minWarning'))}
                </div>`
            )
          ),

          UI.Group(
            html`<div class="px-m">${UI.Subheader(t('ndmod.allowed'))}</div>`,
            UI.Choice({
              value: rule.allowedDays?.type ?? 'all',
              items: [
                {
                  value: 'all',
                  text: t('ndmod.all'),
                  onToggle: () => onChange({ ...rule, allowedDays: undefined }),
                },
                {
                  value: 'month',
                  text: t('ndmod.month'),
                  onToggle: () =>
                    onChange({
                      ...rule,
                      allowedDays: { type: 'month', days: [] },
                    }),
                  content: () =>
                    NdmRuleDatePicker({
                      t,
                      disabled,
                      values: rule.allowedDays?.days ?? [],
                      onChange: days =>
                        onChange({
                          ...rule,
                          allowedDays: { type: 'month', days },
                        }),
                    }),
                },
                {
                  value: 'day',
                  text: t('ndmod.day'),
                  onToggle: () =>
                    onChange({
                      ...rule,
                      allowedDays: { type: 'day', days: [] },
                    }),
                  content: () =>
                    NdmRuleWeekdayPicker({
                      t,
                      locale,
                      disabled,
                      values: rule.allowedDays?.days ?? [],
                      onChange: days =>
                        onChange({
                          ...rule,
                          allowedDays: { type: 'day', days },
                        }),
                    }),
                },
              ],
            })
          ),

          UI.Group(
            html`<div class="px-m">${UI.Subheader(t('ndmod.allowed'))}</div>`,

            UI.List({
              items: rule.disallowedDates ?? [],
              getText: value =>
                new Date(value).toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                }),
              onRemove: index =>
                onChange({
                  ...rule,
                  disallowedDates: rule.disallowedDates?.filter(
                    (_, i) => i !== index
                  ),
                }),
            }),

            html`
              <div class="p-m flex space-x-m">
                <vaadin-date-picker
                  .placeholder=${t('ndmod.select')}
                  @change=${addDisallowedDate}
                ></vaadin-date-picker>
              </div>
            `
          )
        )}
      </details>
    `
  );
}
