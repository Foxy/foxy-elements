import { Operator, Option, ParsedValue } from '../types';
import { TemplateResult, html } from 'lit-html';

import { I18n } from '../../I18n/I18n';
import { Rule } from './Rule';
import { repeat } from 'lit-html/directives/repeat';

export type GroupParams = {
  parsedValues: (ParsedValue | ParsedValue[])[];
  operators: Operator[];
  disableOr: boolean;
  disabled: boolean;
  readonly: boolean;
  options: Option[];
  t: I18n['t'];
  isNested?: boolean;
  onChange: (newValue: (ParsedValue | ParsedValue[])[]) => void;
};

export function Group(params: GroupParams): TemplateResult {
  const hasNestedRules = params.parsedValues.some(v => Array.isArray(v));
  const andDivider = html`<div class=${hasNestedRules ? 'h-xs' : 'mt-s'}></div>`;

  const orDivider = html`
    <div class="flex items-center h-s">
      <div class="w-m text-center leading-none uppercase font-medium text-xs text-contrast-30">
        ${params.t('or')}
      </div>

      <div class="flex-1 border-t border-contrast-20"></div>
      <div class="w-m ml-s flex-shrink-0"></div>
      <div class="hidden sm-block w-m flex-shrink-0"></div>
    </div>
  `;

  return html`
    <div aria-label=${params.t('query_builder_group')}>
      ${repeat(
        [...params.parsedValues, null],
        (rule, ruleIndex) => String(ruleIndex),
        (rule, ruleIndex) => {
          const divider = ruleIndex > 0 ? (params.isNested ? orDivider : andDivider) : '';

          if (rule === null) {
            return [
              divider,
              Rule({
                operators: params.operators,
                disableOr: params.disableOr,
                isFullSize: !params.isNested && params.parsedValues.length === 0,
                isNested: params.isNested,
                disabled: params.disabled,
                readonly: params.readonly,
                options: params.options,
                parsedValue: { path: '', operator: null, value: '' },
                t: params.t,
                onChange: newValue => params.onChange([...params.parsedValues, newValue]),
              }),
            ];
          }

          if (Array.isArray(rule)) {
            return [
              divider,
              html`
                <div class="bg-contrast-10 rounded-t-l rounded-b-l p-s -m-s">
                  ${Group({
                    parsedValues: rule,
                    disableOr: params.disableOr,
                    operators: params.operators,
                    isNested: true,
                    disabled: params.disabled,
                    readonly: params.readonly,
                    options: params.options,
                    t: params.t,
                    onChange: newRule => {
                      const newValue = [...params.parsedValues];
                      const typedNewRule = newRule as ParsedValue[];
                      newValue[ruleIndex] = newRule.length > 1 ? typedNewRule : typedNewRule[0];
                      params.onChange(newValue);
                    },
                  })}
                </div>
              `,
            ];
          }

          return [
            divider,
            Rule({
              parsedValue: rule,
              disableOr: params.disableOr,
              operators: params.operators,
              isNested: params.isNested,
              disabled: params.disabled,
              readonly: params.readonly,
              options: params.options,
              t: params.t,
              onChange: newValue => {
                const newParsedValues = [...params.parsedValues];
                newParsedValues[ruleIndex] = newValue;
                params.onChange(newParsedValues);
              },
              onDelete: () => {
                const newParsedValues = params.parsedValues.filter((_, i) => i !== ruleIndex);
                params.onChange(newParsedValues);
              },
              onConvert: () => {
                const newValue = [...params.parsedValues];
                newValue[ruleIndex] = [rule, { ...rule, operator: null, value: '' }];
                params.onChange(newValue);
              },
            }),
          ];
        }
      )}
    </div>
  `;
}
