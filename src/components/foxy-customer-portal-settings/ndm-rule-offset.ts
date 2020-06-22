import '@vaadin/vaadin-text-field/vaadin-number-field';
import '@vaadin/vaadin-select';
import { html } from 'lit-element';
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
  t: (key: string) => string;
  rule: Rule;
  disabled: boolean;
  onChange: (value?: Rule) => void;
}

interface NdmRuleOffsetParams extends NdmRuleParams {
  type: 'min' | 'max';
}


export function NdmRuleOffset({ t, type, rule, onChange }: NdmRuleOffsetParams) {
  const numericValue = rule[type]?.replace(/(y|m|w|d)/, '');
  const valueUnits = rule[type]?.replace(/\d+(\.\d*)?/, '');

  const changeValue = (evt: InputEvent) => {
    const value = (evt.target as HTMLInputElement).value;
    onChange({ ...rule, [type]: rule[type]?.replace(/\d+(\.\d*)?/, value) });
  };

  const changeUnits = (evt: InputEvent) => {
    const value = (evt.target as HTMLInputElement).value;
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
          content: html`
            <div class="flex flex-col py-s sm:flex-row">
              <div class="w-full sm:w-1/2 sm:pr-xs">
                <vaadin-number-field class="w-full mb-s sm:mb-0" has-controls min="1" .value=${numericValue} @change=${changeValue}></vaadin-number-field>
              </div>

              <div class="w-full sm:w-1/2 sm:pl-xs">
                <vaadin-select class="w-full" .value=${valueUnits} @change=${changeUnits}>
                  <template>
                    <vaadin-list-box>
                      <vaadin-item value="y">${t('ndmod.years')}</vaadin-item>
                      <vaadin-item value="m">${t('ndmod.months')}</vaadin-item>
                      <vaadin-item value="w">${t('ndmod.weeks')}</vaadin-item>
                      <vaadin-item value="d">${t('ndmod.days')}</vaadin-item>
                    </vaadin-list-box>
                  </template>
                </vaadin-select>
              </div>
            </div>

            ${UI.Hint('TODO: requires the new date to be at least 2 weeks into the future.')}
          `
        }
      ],
    })
  );
}
