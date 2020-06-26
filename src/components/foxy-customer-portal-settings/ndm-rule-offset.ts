import '@vaadin/vaadin-text-field/vaadin-number-field';
import { html } from 'lit-element';
import { TFunction } from 'i18next';
import { parseDuration } from '../../common/utils.js';
import * as UI from '../../layout/index.js';

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
  disabled: boolean;
  onChange: (value?: Rule) => void;
}

interface NdmRuleOffsetParams extends NdmRuleParams {
  type: 'min' | 'max';
}

export function NdmRuleOffset({ t, type, rule, onChange }: NdmRuleOffsetParams) {
  const { count: numericValue, units: valueUnits } = parseDuration(rule[type] ?? '');

  const changeValue = (evt: InputEvent) => {
    const value = (evt.target as HTMLInputElement).value;
    onChange({ ...rule, [type]: rule[type]?.replace(/\d+(\.\d*)?/, value) });
  };

  const changeUnits = (value: string) => {
    onChange({ ...rule, [type]: rule[type]?.replace(/(y|m|w|d)/, value) });
  };

  return UI.Group(
    html`<div class="px-m">${UI.Subheader(t(`ndmod.${type}`))}</div>`,
    UI.Choice({
      value: rule[type] === undefined ? 'none' : 'custom',
      items: [
        {
          text: t('ndmod.noRestrictions'),
          value: 'none',
          onToggle: () => onChange({ ...rule, [type]: undefined })
        },
        {
          text: t('ndmod.customOffset'),
          value: 'custom',
          onToggle: () => onChange({ ...rule, [type]: '2w' }),
          content: () => html`
            <div class="flex flex-col py-s sm:flex-row">
              <div class="w-full sm:w-1/2 sm:pr-xs">
                <vaadin-number-field class="w-full mb-s sm:mb-0" has-controls min="1" .value=${numericValue} @change=${changeValue}></vaadin-number-field>
              </div>

              <div class="w-full sm:w-1/2 sm:pl-xs">
                ${UI.Dropdown({
                  fullWidth: true,
                  value: valueUnits,
                  items: [
                    { text: t('y_plural'), value: 'y' },
                    { text: t('m_plural'), value: 'm' },
                    { text: t('w_plural'), value: 'w' },
                    { text: t('d_plural'), value: 'd' }
                  ],
                  onChange: changeUnits
                })}
              </div>
            </div>

            ${UI.Hint(t(`ndmod.${type}Hint`, {
              duration: t('duration', {
                count: numericValue,
                units: t(valueUnits ?? '', { count: numericValue })
              })
            }))}
          `
        }
      ],
    })
  );
}
