import type { Operator, Option, Rule } from '../types';
import type { TemplateResult } from 'lit-html';
import type { I18n } from '../../I18n/I18n';

import { AdvancedRule } from './AdvancedRule';
import { repeat } from 'lit-html/directives/repeat';
import { html } from 'lit-html';

type Params = {
  operators: Operator[];
  disableOr: boolean;
  isNested?: boolean;
  disabled: boolean;
  readonly: boolean;
  options: Option[];
  rules: (Rule | Rule[])[];
  t: I18n['t'];
  onChange: (newValue: (Rule | Rule[])[]) => void;
};

export function AdvancedGroup(params: Params): TemplateResult {
  const hasNestedRules = params.rules.some(v => Array.isArray(v));
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
        [...params.rules, null],
        (rule, ruleIndex) => String(ruleIndex),
        (rule, ruleIndex) => {
          const divider = ruleIndex > 0 ? (params.isNested ? orDivider : andDivider) : '';

          if (rule === null) {
            return [
              divider,
              AdvancedRule({
                ...params,
                rule: { path: '', operator: null, value: '' },
                isFullSize: !params.isNested && params.rules.length === 0,
                onChange: newValue => params.onChange([...params.rules, newValue]),
              }),
            ];
          }

          if (Array.isArray(rule)) {
            return [
              divider,
              html`
                <div class="bg-contrast-10 rounded-t-l rounded-b-l p-s -m-s">
                  ${AdvancedGroup({
                    ...params,
                    rules: rule,
                    isNested: true,
                    onChange: newRule => {
                      const newValue = [...params.rules];
                      const typedNewRule = newRule as Rule[];
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
            AdvancedRule({
              ...params,
              rule: rule,
              onChange: newValue => {
                const newRules = [...params.rules];
                newRules[ruleIndex] = newValue;
                params.onChange(newRules);
              },
              onDelete: () => {
                const newRules = params.rules.filter((_, i) => i !== ruleIndex);
                params.onChange(newRules);
              },
              onConvert: () => {
                const newRules = [...params.rules];
                newRules[ruleIndex] = [rule, { ...rule, operator: null, value: '' }];
                params.onChange(newRules);
              },
            }),
          ];
        }
      )}
    </div>
  `;
}
