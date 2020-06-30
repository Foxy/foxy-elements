import '@vaadin/vaadin-checkbox';
import { TemplateResult, html } from 'lit-html';
import { ifDefined } from 'lit-html/directives/if-defined';
import { Group } from './group';

interface CheckboxParams {
  name?: string;
  value?: boolean;
  content?: string | TemplateResult | (string | TemplateResult)[];
  disabled?: boolean;
  onChange?: (value: boolean) => void;
}

export function Checkbox(params?: CheckboxParams) {
  const checked = params?.value ?? false;
  const disabled = params?.disabled ?? false;
  const onChange = () => params?.onChange?.(!params.value);

  const [label, ...rest] = Array.isArray(params?.content)
    ? params!.content
    : typeof params?.content === 'undefined'
    ? []
    : [params.content];

  return Group(
    html`
      <vaadin-checkbox
        style="margin-left: -3px"
        name=${ifDefined(params?.name)}
        .checked=${checked}
        .disabled=${disabled}
        @change=${onChange}
      >
        <div style="padding-left: 0.5rem">${label}</div>
      </vaadin-checkbox>
      ${rest.length > 0
        ? html`<div style="padding-left: 2.2rem">${rest}</div>`
        : ''}
    `
  );
}
