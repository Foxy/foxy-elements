import { TemplateResult, html } from 'lit-html';

import { AttributeFormElement } from '../../AttributeForm';
import { HypermediaResourceDialog } from '../../../private/Dialog/HypermediaResourceDialog';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { UpdateEvent } from '../../../private';

export class FormDialog extends HypermediaResourceDialog {
  static get scopedElements(): ScopedElementsMap {
    return {
      ...super.scopedElements,
      'foxy-attribute-form': customElements.get(AttributeFormElement.defaultNodeName),
    };
  }

  closable = true;

  editable = true;

  render(): TemplateResult {
    return super.render(() => {
      return html`
        <foxy-attribute-form
          .lang=${this.lang}
          .href=${this.href}
          id="form"
          @update=${(evt: UpdateEvent) => {
            this.editable = evt.detail.state.includes('idle.snapshot.modified.valid');
            this.closable = evt.detail.state.includes('idle');
          }}
        >
        </foxy-attribute-form>
      `;
    });
  }

  async save(): Promise<void> {
    const form = this.renderRoot.querySelector('#form') as AttributeFormElement;
    form.submit();
  }
}
