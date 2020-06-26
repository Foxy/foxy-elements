import '@vaadin/vaadin-radio-button/vaadin-radio-group';
import { TemplateResult, html } from 'lit-html';

interface ChoiceParams {
  disabled?: boolean;
  value: string;
  items: {
    text: string;
    value: string;
    onToggle?: (newValue: boolean) => void;
    content?: () => string | TemplateResult | (string | TemplateResult)[];
  }[];
}

export function Choice(params: ChoiceParams) {
  return html`
    <vaadin-radio-group
      class="w-full"
      style="padding: 13px 0 13px 16px"
      .value=${params.value}
    >
      ${params.items.map(
        (item, index) => html`
          ${index > 0
            ? html`<div
                class="border-t border-shade-10"
                style="margin: 13px 0 13px 32px"
              ></div>`
            : ''}

          <vaadin-radio-button
            class="w-full"
            style="margin: -3px"
            value=${item.value}
            .disabled=${params.disabled ?? false}
            @change=${(evt: Event) =>
              item.onToggle?.((evt.target as HTMLInputElement).checked)}
          >
            <div style="margin-left: 5px">${item.text}</div>
          </vaadin-radio-button>

          ${item.value === params.value
            ? html`
                <div class="pl-l pr-m mt-s ml-s">
                  ${item.content?.()}
                </div>
              `
            : ''}
        `
      )}
    </vaadin-radio-group>
  `;
}
