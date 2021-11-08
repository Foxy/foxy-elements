import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { Option } from './types';
import { QueryBuilderRule } from './QueryBuilderRule';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';
import { classMap } from '../../../utils/class-map';
import { repeat } from 'lit-html/directives/repeat';

class QueryBuilder extends ThemeableMixin(TranslatableMixin(LitElement, 'query-builder')) {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      options: { type: Array },
      value: { type: String },
    };
  }

  options: Option[] | null = null;

  value: string | null = '';

  render(): TemplateResult {
    const splitValue = this.value
      ?.split('&')
      .filter(v => !!v)
      .map(entry => {
        const [name, value] = entry.split('=').map(decodeURIComponent);
        if (!value?.includes('|')) return entry;
        return `${encodeURIComponent(name)}=${value}`.split('|');
      });

    return this.__renderGroup(splitValue ?? [], JSON.stringify(this.options), false, newValue => {
      this.value = newValue
        .map(v => {
          if (typeof v === 'string') return v;
          if (v.length < 2) return v.join();
          return `${v[0]}${encodeURIComponent(`|${v.slice(1).join('|')}`)}`;
        })
        .join('&');

      this.dispatchEvent(new CustomEvent('change'));
    });
  }

  private __renderGroup(
    value: (string | string[])[],
    options: string,
    isNested: boolean,
    onChange: (newValue: (string | string[])[]) => void
  ): TemplateResult {
    const orDivider = html`
      <div class="flex">
        <div class="flex items-center flex-1 h-xs">
          <div class="flex-1 border-t border-success-50"></div>
          <div class="leading-none uppercase font-semibold text-xs text-secondary px-s">
            <foxy-i18n lang=${this.lang} key="or" ns=${this.ns}></foxy-i18n>
          </div>
          <div class="flex-1 border-t border-success-50"></div>
        </div>
        <div class="w-m ml-s flex-shrink-0"></div>
      </div>
    `;

    const spacer = html`<div class="h-xs"></div>`;

    return html`
      ${repeat(
        [...value, null],
        (_, i) => String(i),
        (rule, ruleIndex) => {
          let divider = ruleIndex > 0 ? (isNested ? orDivider : spacer) : '';
          let ruleTemplate: TemplateResult;

          if (typeof rule === 'string') {
            const handleRuleDelete = () => {
              onChange(value.filter((_, i) => i !== ruleIndex));
            };

            const handleRuleChange = (newValue: string) => {
              onChange(value.map((v, i) => (i === ruleIndex ? newValue : v)));
            };

            const handleRuleConvert = () => {
              onChange(
                value.map((v, i) => {
                  if (i !== ruleIndex) return v;
                  return [v as string, `${(v as string).split('=')[0]}=`];
                })
              );
            };

            ruleTemplate = this.__renderRule({
              value: rule,
              options,
              isNested,
              onChange: handleRuleChange,
              onDelete: handleRuleDelete,
              onConvert: handleRuleConvert,
            });
          } else if (Array.isArray(rule)) {
            ruleTemplate = html`
              <div class="bg-success-10 rounded-t-l rounded-b-l p-s -m-s">
                ${this.__renderGroup(rule, options, true, newValue => {
                  onChange(value.map((v, i) => (i === ruleIndex ? (newValue as string[]) : v)));
                })}
              </div>
            `;
          } else {
            divider = ruleIndex > 0 ? spacer : '';
            ruleTemplate = this.__renderRule({
              value: '',
              options,
              isNested,
              onChange: newValue => {
                onChange([...value, newValue]);
              },
            });
          }

          return html`${divider}${ruleTemplate}`;
        }
      )}
    `;
  }

  private __renderRule({
    value,
    options,
    isNested = false,
    onChange,
    onDelete,
    onConvert,
  }: {
    value: string;
    options: string;
    isNested?: boolean;
    onChange?: (newValue: string) => void;
    onDelete?: () => void;
    onConvert?: () => void;
  }) {
    return html`
      <div class="flex space-x-s">
        <foxy-query-builder-rule
          options=${options}
          value=${value}
          class=${classMap({
            'flex-1 bg-base rounded overflow-hidden border': true,
            'border-contrast-10': !isNested,
            'border-success-50': isNested,
          })}
          lang=${this.lang}
          ns=${this.ns}
          @change=${(evt: CustomEvent) => {
            const target = evt.currentTarget as QueryBuilderRule;
            onChange?.(target.value ?? '');
          }}
        >
        </foxy-query-builder-rule>

        ${value
          ? html`
              <div
                class="-mr-s flex flex-col flex-shrink-0 items-center border-t border-b border-transparent divide-y divide-transparent"
              >
                <button
                  aria-label=${this.t('delete')}
                  class=${classMap({
                    'box-content flex w-m h-m rounded-full transition-colors': true,
                    'text-secondary': true,
                    'hover-bg-error-10 hover-text-error': !isNested,
                    'hover-bg-base hover-text-error': isNested,
                    'focus-outline-none focus-ring-2 ring-error-50': true,
                    'hidden': !value,
                  })}
                  ?disabled=${!value}
                  @click=${onDelete}
                >
                  <iron-icon icon="icons:remove-circle-outline" class="m-auto icon-inline text-xl">
                  </iron-icon>
                </button>

                <button
                  aria-label=${this.t('add_or_clause')}
                  class=${classMap({
                    'box-content flex w-m h-m rounded-full transition-colors': true,
                    'text-success': true,
                    'hover-bg-success-10 focus-outline-none focus-ring-2 ring-success-50': true,
                    'hidden': !value || isNested,
                  })}
                  ?disabled=${!value}
                  @click=${onConvert}
                >
                  <iron-icon icon="icons:add-circle-outline" class="m-auto icon-inline text-xl">
                  </iron-icon>
                </button>
              </div>
            `
          : ''}
      </div>
    `;
  }
}

export { QueryBuilder };
