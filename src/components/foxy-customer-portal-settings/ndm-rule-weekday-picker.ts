import { html } from 'lit-element';
import * as UI from '../../layout/index.js';

interface NdmRulePickerParams {
  t: (key: string) => string;
  values: number[];
  disabled: boolean;
  onChange: (values: number[]) => void;
}

export function NdmRuleWeekdayPicker({ values, onChange }: NdmRulePickerParams) {
  const days = new Array(7).fill(14).map((v, i) =>
    new Date(`2020-06-${v + i}T00:00:00.0Z`).toLocaleDateString("en", {
      weekday: 'short',
    })
  );

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
    UI.Hint('TODO: your customers will be able to select only Tuesdays, Wednesdays and Saturdays for the next payment date.')
  )
}
