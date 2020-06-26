import { html } from 'lit-element';
import { TFunction } from 'i18next';
import { translateWeekday } from '../../common/utils.js';
import * as UI from '../../layout/index.js';

interface NdmRulePickerParams {
  t: TFunction;
  locale: string;
  values: number[];
  disabled: boolean;
  onChange: (values: number[]) => void;
}

export function NdmRuleWeekdayPicker({ t, locale, values, onChange }: NdmRulePickerParams) {
  const days = new Array(7).fill(0).map((_, i) => translateWeekday(i, locale, 'short'));

  const getLabelClass = (day: number) => {
    let base = 'flex items-center justify-center m-xs h-m w-xl rounded font-medium ';
    base += values.includes(day) ? 'text-base bg-primary' : 'bg-shade-5 text-primary';
    return base;
  };

  const toggle = (day: number) => {
    if (values.includes(day)) {
      onChange(values.filter(v => v !== day));
    } else {
      onChange([...values, day ]);
    }
  };

  return UI.Group(
    html`
      <div class="flex flex-wrap -mx-xs -mb-xs text-m uppercase">
        ${days.map((day, index) => {
          return html`
            <label class=${getLabelClass(index)}>
              ${day}
              <input type="checkbox" class="sr-only" ?checked=${values.includes(index)} @change=${() => toggle(index)}>
            </label>
          `
        })}
      </div>
    `,
    UI.If(
      values.length > 0,
      () => UI.Hint(
        t('ndmod.dayHint', { days: values.map(v => translateWeekday(v, locale))})
      )
    )
  )
}
