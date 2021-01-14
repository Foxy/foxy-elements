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

  render(): TemplateResult {
    return super.render(() => {
      return html`
        <foxy-attribute-form
          lang=${this.lang}
          href=${this.href ?? ''}
          id="form"
          @update=${this.__handleUpdate}
        >
        </foxy-attribute-form>
      `;
    });
  }

  async save(): Promise<void> {
    this.__getForm().submit();
  }

  private __handleUpdate(evt: UpdateEvent) {
    this.editable = evt.detail.state.includes('idle.snapshot.modified.valid');
    this.closable = evt.detail.state.includes('idle');
  }

  private __getForm() {
    return this.renderRoot.querySelector('#form') as AttributeFormElement;
  }
}
