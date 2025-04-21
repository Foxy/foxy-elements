import type { TemplateResult } from 'lit-html';
import type { Operator, Rule } from '../types';
import type { I18n } from '../../I18n/I18n';

import { AdvancedOperatorToggle } from './AdvancedOperatorToggle';
import { AdvancedInput } from './AdvancedInput';
import { classMap } from '../../../../utils/class-map';
import { field } from '../icons/index';
import { html } from 'lit-html';

type Params = {
  isFullSize?: boolean;
  isNested?: boolean;
  operators: Operator[];
  disableOr: boolean;
  readonly: boolean;
  disabled: boolean;
  rule: Rule;
  t: I18n['t'];
  onConvert?: () => void;
  onDelete?: () => void;
  onChange: (newValue: Rule) => void;
};

export function AdvancedRule(params: Params): TemplateResult {
  const { isFullSize, isNested, disableOr, readonly, disabled, rule } = params;
  const { t, onConvert, onDelete, onChange } = params;

  return html`
    <div class="flex items-center space-x-s" aria-label=${t('query_builder_rule')}>
      <div
        class=${classMap({
          'flex-1 bg-base rounded overflow-hidden border': true,
          'border-contrast-10': !isNested && !readonly,
          'border-contrast-50': !!isNested || readonly,
          'border-dashed': readonly,
          'border-solid': !readonly,
        })}
      >
        <div class="bg-contrast-10">
          <div class="grid gap-1px grid-vertical sm-grid-horizontal">
            <div class="bg-base">
              <div
                aria-hidden="true"
                class=${classMap({
                  'text-tertiary': !readonly && !disabled,
                  'text-disabled': readonly || disabled,
                  'w-m h-m': true,
                })}
              >
                ${field}
              </div>
            </div>

            <div class="bg-base">
              ${rule.path && rule.name
                ? html`
                    <div class="bg-contrast-10 grid gap-1px grid-cols-1 sm-grid-cols-2">
                      <div class="bg-base">
                        ${AdvancedInput({
                          ...params,
                          value: rule.path,
                          label: 'field',
                          onChange: newPath => {
                            onChange({ operator: null, value: '', path: newPath });
                          },
                        })}
                      </div>
                      <div class="bg-base">
                        ${AdvancedInput({
                          ...params,
                          value: rule.name ?? '',
                          label: 'name',
                          onChange: newValue => onChange({ ...rule, name: newValue }),
                        })}
                      </div>
                    </div>
                  `
                : AdvancedInput({
                    ...params,
                    value: rule.path,
                    label: 'field',
                    onChange: newPath => onChange({ operator: null, value: '', path: newPath }),
                  })}
            </div>

            <div class="bg-base">${AdvancedOperatorToggle(params)}</div>
            <div class="bg-base">
              ${AdvancedInput({
                ...params,
                disabled: disabled || !rule.path,
                value: rule.value ?? '',
                label: 'value',
                onChange: newValue => onChange({ ...rule, value: newValue }),
              })}
            </div>
          </div>
        </div>
      </div>

      <div
        class=${classMap({
          '-mr-s self-start flex-col sm-flex-row flex-shrink-0 items-center': true,
          'border-t border-b border-transparent divide-y divide-transparent': true,
          'hidden': !!isFullSize || readonly,
          'flex': !isFullSize,
        })}
      >
        <button
          aria-label=${t('delete')}
          class=${classMap({
            'box-content flex w-m h-m rounded-full transition-colors': true,
            'text-secondary hover-bg-contrast-5 hover-text-error': !disabled,
            'cursor-default text-disabled': disabled,
            'focus-outline-none focus-ring-2 ring-primary-50': true,
            'opacity-0 pointer-events-none': !rule.path,
          })}
          ?disabled=${disabled || readonly || !rule.path}
          @click=${onDelete}
        >
          <iron-icon
            aria-hidden="true"
            class="m-auto icon-inline text-xl"
            icon="icons:remove-circle-outline"
          >
          </iron-icon>
        </button>

        <button
          aria-label=${t('add_or_clause')}
          class=${classMap({
            'box-content flex w-m h-m rounded-full transition-colors': true,
            'text-success hover-bg-contrast-5': !disabled,
            'cursor-default text-disabled': disabled,
            'focus-outline-none focus-ring-2 ring-primary-50': true,
            'opacity-0 pointer-events-none': !rule.path || !!isNested || disableOr,
          })}
          ?disabled=${disabled || readonly || !rule.path || !!isNested || disableOr}
          ?hidden=${disableOr}
          @click=${onConvert}
        >
          <iron-icon
            aria-hidden="true"
            class="m-auto icon-inline text-xl"
            icon="icons:add-circle-outline"
          >
          </iron-icon>
        </button>
      </div>
    </div>
  `;
}
