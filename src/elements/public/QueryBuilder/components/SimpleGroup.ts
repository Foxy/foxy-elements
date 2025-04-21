import type { TemplateResult } from 'lit-html';
import type { Option, Rule } from '../types';

import { SimpleAttributeRule } from './SimpleAttributeRule';
import { SimpleBooleanRule } from './SimpleBooleanRule';
import { SimpleNumberRule } from './SimpleNumberRule';
import { SimpleStringRule } from './SimpleStringRule';
import { SimpleDateRule } from './SimpleDateRule';
import { SimpleListRule } from './SimpleListRule';
import { SimpleSelect } from './SimpleSelect';
import { ifDefined } from 'lit-html/directives/if-defined';
import { classMap } from '../../../../utils/class-map';
import { html } from 'lit-html';
import { Type } from '../types';

type Params = {
  disabled: boolean;
  readonly: boolean;
  options: Option[];
  layout?: string;
  rules: Rule[];
  name?: string;
  t: (key: string) => string;
  onChange: (newParsedValue: Rule[]) => void;
};

export function SimpleGroup(params: Params): TemplateResult {
  const { options, layout, rules, name, disabled, readonly, t, onChange } = params;

  const editedOptions = options.filter(v => rules.find(vv => vv.path === v.path));
  const orderRule = rules.find(v => v.path === 'order');
  const parsedOrderRule = orderRule?.value?.split(',').map(v => {
    const [path, order = 'asc'] = decodeURIComponent(v).split(' ');
    return { path: path.trim(), order: order.trim() };
  });

  return html`
    <foxy-internal-summary-control
      aria-label=${params.t('query_builder_group')}
      helper-text=""
      layout=${ifDefined(layout)}
      label=${layout && name ? t(name) : ''}
      count=${ifDefined(editedOptions.length || void 0)}
      infer=""
    >
      ${options.map(option => {
        const { type, label, list, path } = option;

        const controlsRenderers = {
          [Type.Attribute]: SimpleAttributeRule,
          [Type.Boolean]: SimpleBooleanRule,
          [Type.String]: SimpleStringRule,
          [Type.Number]: SimpleNumberRule,
          [Type.Date]: SimpleDateRule,
          [Type.Any]: SimpleStringRule,
        } as const;

        const Control = list ? SimpleListRule : controlsRenderers[type];
        const order = parsedOrderRule?.find(v => v.path === path)?.order;
        const rule = rules.find(rule => rule.path === path);
        const isDirty = !!rule || !!order;

        return html`
          <div
            aria-label=${t('query_builder_rule')}
            class=${classMap({
              'flex flex-wrap items-center justify-end gap-s': true,
              'bg-primary-10 text-primary': isDirty,
            })}
          >
            <foxy-i18n infer="" key=${label}></foxy-i18n>
            <span class="transform scale-150 mr-auto ${isDirty ? '' : 'opacity-0'}">&bull;</span>
            ${Control({
              disabled,
              readonly,
              option,
              rule,
              t,
              onChange: newParsedValue => {
                if (newParsedValue && rule) {
                  Object.assign(rule, newParsedValue);
                  return onChange(rules);
                } else if (newParsedValue) {
                  const defaults = { path: path, value: '', operator: null };
                  return onChange([...rules, { ...defaults, ...newParsedValue }]);
                } else {
                  return onChange(rules.filter(v => v.path !== path));
                }
              },
            })}
            ${type === Type.Date || type === Type.Number
              ? SimpleSelect({
                  disabled,
                  readonly,
                  t,
                  current: {
                    label: `order_${order ?? 'none'}${order ? `_${type}` : ''}`,
                    value: order ?? 'none',
                  },
                  options: [
                    { label: 'order_none', value: 'none' },
                    { label: `order_asc_${type}`, value: 'asc' },
                    { label: `order_desc_${type}`, value: 'desc' },
                  ],
                  onChange: newSelection => {
                    const newParsedOrderRule = (parsedOrderRule ?? [])
                      .filter(v => v.path !== path)
                      .concat([{ path, order: newSelection }]);

                    const newOrderValue = newParsedOrderRule
                      .filter(v => v.order !== 'none')
                      .map(v => `${v.path} ${v.order}`)
                      .join();

                    const newRules = rules.filter(v => v.path !== 'order');
                    if (newOrderValue) {
                      newRules.push({ path: 'order', value: newOrderValue, operator: null });
                    }

                    onChange(newRules);
                  },
                })
              : ''}
          </div>
        `;
      })}
    </foxy-internal-summary-control>
  `;
}
