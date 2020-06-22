import '@vaadin/vaadin-date-picker';
import { html } from 'lit-element';
import * as UI from '../../layout/index.js';
import { NdmRuleWeekdayPicker } from './ndm-rule-weekday-picker.js';
import { NdmRuleDatePicker } from './ndm-rule-date-picker.js';
import { NdmRuleJsonata } from './ndm-rule-jsonata.js';
import { NdmRuleOffset } from './ndm-rule-offset.js';

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
  t: (key: string) => string;
  rule: Rule;
  disabled: boolean;
  onChange: (value?: Rule) => void;
}

export function NdmRule({ t, rule, disabled, onChange }: NdmRuleParams) {
  const addDisallowedDate = (evt: InputEvent) => {
    const input = evt.target as HTMLInputElement;
    const dates = rule.disallowedDates ?? [];

    if (input.value.length > 0) {
      onChange({ ...rule, disallowedDates: [...dates, input.value ]} );
      setTimeout(() => (input.value = ''), 0);
    }
  };

  return UI.Frame(
    html`
      <details>
        <summary class="relative leading-s">
          <div class="p-m text-m text-header font-medium">
            Dynamic title - TODO
          </div>

          <button class="flex items-center justify-center absolute top-0 right-0 text-tertiary" style="width: 54px; height: 54px" @click=${(evt: MouseEvent) => [evt.preventDefault(), onChange()]}>
            <iron-icon icon="lumo:cross"></iron-icon>
          </button>
        </summary>

        ${
          UI.Section(
            UI.Group(
              html`<div class="px-m">${UI.Subheader(t('ndmod.match'))}</div>`,
              NdmRuleJsonata({ t, rule, disabled, onChange })
            ),

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

            UI.Group(
              html`<div class="px-m">${UI.Subheader(t('ndmod.allowed'))}</div>`,
              UI.Choice({
                value: rule.allowedDays?.type ?? 'all',
                items: [
                  {
                    value: 'all',
                    text: t('ndmod.all'),
                    onToggle: () => onChange({ ...rule, allowedDays: undefined })
                  },
                  {
                    value: 'month',
                    text: t('ndmod.month'),
                    onToggle: () => onChange({ ...rule, allowedDays: { type: 'month', days: [] } }),
                    content: NdmRuleDatePicker({
                      t,
                      disabled,
                      values: rule.allowedDays?.days ?? [],
                      onChange: (days) => onChange({ ...rule, allowedDays: { type: 'month', days }})
                    })
                  },
                  {
                    value: 'day',
                    text: t('ndmod.day'),
                    onToggle: () => onChange({ ...rule, allowedDays: { type: 'day', days: [] } }),
                    content: NdmRuleWeekdayPicker({
                      t,
                      disabled,
                      values: rule.allowedDays?.days ?? [],
                      onChange: (days) => onChange({ ...rule, allowedDays: { type: 'day', days }})
                    })
                  },
                ]
              })
            ),

            UI.Group(
              html`<div class="px-m">${UI.Subheader(t('ndmod.allowed'))}</div>`,

              UI.List({
                items: rule.disallowedDates ?? [],
                onRemove: (index) => onChange({
                  ...rule,
                  disallowedDates: rule.disallowedDates?.filter((_, i) => i !== index)
                })
              }),

              html`
                <div class="p-m flex space-x-m">
                  <vaadin-date-picker .placeholder=${t('ndmod.select')} @change=${addDisallowedDate}></vaadin-date-picker>
                </div>
              `
            )
          )
        }
      </details>
    `,
  );
}
