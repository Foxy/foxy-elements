import './index';

import { TemplateResult, html } from 'lit-html';

import { Args } from '../../../storygen/Args';
import { Summary } from '../../../storygen/Summary';
import { getMeta } from '../../../storygen/getMeta';
import { getStoryArgs } from '../../../storygen/getStoryArgs';
import { ifDefined } from 'lit-html/directives/if-defined';

const summary: Summary = {
  localName: 'foxy-pagination',
  translatable: true,
  configurable: {},
};

export default getMeta(summary);

export const Playground = (args: Args): TemplateResult => html`
  <foxy-pagination
    disabledcontrols=${args.disabledControls?.join(' ') ?? ''}
    first=${ifDefined(args.first)}
    group=${ifDefined(args.group)}
    lang=${ifDefined(args.lang)}
    ns=${ifDefined(args.ns)}
    ?disabled=${args.disabled}
  >
    <foxy-customers-table
      class="mb-2 px-4 border rounded-lg"
      group=${ifDefined(args.group)}
      lang=${ifDefined(args.lang)}
      ns=${ifDefined(args.ns)}
    >
    </foxy-customers-table>
  </foxy-pagination>
`;

Playground.args = getStoryArgs(summary);
Playground.args.first = 'https://demo.api/hapi/customers?limit=3';
