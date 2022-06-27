import './index';

import { TemplateResult, html } from 'lit-html';

export default {
  title: 'Other / DiscountBuilder',
  component: 'foxy-discount-builder',
  argTypes: {
    disabled: { control: { type: 'boolean' } },
    readonly: { control: { type: 'boolean' } },
    value: { control: { type: 'text' } },
    lang: { control: { type: 'text' } },
  },
};

export const Playground = (args: Record<string, unknown>): TemplateResult => html`
  <foxy-discount-builder
    ?disabled=${args.disabled as boolean}
    ?readonly=${args.readonly as boolean}
    value=${args.value as string}
    lang=${args.lang as string}
  >
  </foxy-discount-builder>
`;

Playground.args = {
  disabled: false,
  readonly: false,
  value: 'discount_amount_percentage=Test%7Ballunits%7C1-2%7C3-4%7D',
  lang: 'en',
};
