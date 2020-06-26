import '@vaadin/vaadin-text-field/vaadin-text-field';
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

interface NdmRuleJsonataParams {
  t: (key: string) => string;
  rule: Rule;
  disabled: boolean;
  onChange: (value?: Rule) => void;
}

export function NdmRuleJsonata({ t, rule, onChange }: NdmRuleJsonataParams) {
  const changeJsonata = (evt: InputEvent) => {
    const value = (evt.target as HTMLInputElement).value;
    onChange?.({ ...rule, jsonataQuery: value });
  };

  return UI.Choice({
    value: rule.jsonataQuery === '*' ? 'all' : 'some',
    items: [
      {
        text: t('ndmod.all'),
        value: 'all',
        onToggle: () => onChange({ ...rule, jsonataQuery: '*' })
      },
      {
        text: t('ndmod.some'),
        value: 'some',
        onToggle: () => onChange({ ...rule, jsonataQuery: '$contains(frequency, "w")' }),
        content: () => UI.Group(
          UI.Hint(t('ndmod.jsonataHint')),
          html`<vaadin-text-field class="w-full" placeholder='$contains(frequency, "w")' .value=${rule.jsonataQuery} @input=${changeJsonata}></vaadin-text-field>`
        )
      }
    ]
  });
}
