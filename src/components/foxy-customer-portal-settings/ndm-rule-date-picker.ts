import { html } from 'lit-element';
import * as UI from '../../layout/index.js';

interface NdmRulePickerParams {
  t: (key: string) => string;
  values: number[];
  disabled: boolean;
  onChange: (values: number[]) => void;
}

export function NdmRuleDatePicker({ values, onChange }: NdmRulePickerParams) {
  const days = Array.from(new Array(31), (_, i) => i + 1);

  const getLabelClass = (day: number) => {
    let base = 'flex items-center justify-center m-xs p-s rounded text-m font-medium ';
    
    base += 'sm:p-0 sm:h-m sm:w-l ';
    base += values.includes(day) ? 'text-base ' : 'bg-shade-5 ';
    
    if (day < 29) base += values.includes(day) ? 'bg-primary' : 'text-primary';
    if (day > 28) base += values.includes(day) ? 'bg-error' : 'text-error';
    
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
      <div class="flex flex-wrap -mx-xs -mb-xs" style="max-width: 364px; font-feature-settings: 'tnum' 1;">
        ${days.map(day => {
          return html`
            <label class=${getLabelClass(day)}>
              ${day.toLocaleString('en', { minimumIntegerDigits: 2 })}
              <input type="checkbox" class="sr-only" ?checked=${values.includes(day)} @change=${() => toggle(day)}>
            </label>
          `
        })}
      </div>
    `,
    UI.Hint('TODO: your customers will be able to select only 9th, 13th, 16th, 20th and 31th days of the month as the next payment date. Please note that dates from 29 to 31 may not always be available depending on the month and year.')
  )
}
