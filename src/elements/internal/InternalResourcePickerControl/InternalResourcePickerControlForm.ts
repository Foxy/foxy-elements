import type { PropertyDeclarations, TemplateResult } from 'lit-element';
import type { HALJSONResource } from '../../public/NucleonElement/types';

import { InternalForm } from '../InternalForm/InternalForm';
import { spread } from '@open-wc/lit-helpers';
import { html } from 'lit-html';

type Data = HALJSONResource & { selection: string; query: string };

export class InternalResourcePickerControlForm extends InternalForm<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      selectionProps: { attribute: false },
    };
  }

  selectionProps: Record<PropertyKey, unknown> = {};

  renderBody(): TemplateResult {
    return html`
      <foxy-internal-async-list-control
        infer="selection"
        form="foxy-null"
        hide-delete-button
        hide-create-button
        @itemclick=${(evt: CustomEvent<string>) => {
          evt.preventDefault();
          this.edit({ selection: evt.detail });
          this.submit();
        }}
        ...=${spread(this.selectionProps)}
      >
      </foxy-internal-async-list-control>
    `;
  }
}
