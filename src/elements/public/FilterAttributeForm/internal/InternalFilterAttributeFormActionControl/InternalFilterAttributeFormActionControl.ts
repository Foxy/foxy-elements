import type { FilterAttributeForm } from '../../FilterAttributeForm';
import type { TemplateResult } from 'lit-html';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { html } from 'lit-html';

export class InternalFilterAttributeFormActionControl extends InternalControl {
  renderControl(): TemplateResult {
    const nucleon = this.nucleon as FilterAttributeForm | null;
    const hasChanges = nucleon?.in({ idle: { snapshot: 'dirty' } });
    const hasData = !!nucleon?.data;

    return html`
      <div class="grid grid-cols-2 gap-m">
        ${hasData && hasChanges
          ? html`
              <vaadin-button
                theme="contrast"
                ?disabled=${this.disabled}
                @click=${() => nucleon?.undo()}
              >
                <foxy-i18n infer="" key="reset"></foxy-i18n>
              </vaadin-button>
            `
          : ''}
        <vaadin-button
          theme=${hasData ? (hasChanges ? 'secondary' : 'error') : 'success'}
          class=${hasData && hasChanges ? '' : 'col-span-2'}
          ?disabled=${this.disabled}
          @click=${() => (!hasData || hasChanges ? nucleon?.submit() : nucleon?.delete())}
        >
          <foxy-i18n infer="" key=${hasData ? (hasChanges ? 'update' : 'delete') : 'create'}>
          </foxy-i18n>
        </vaadin-button>
      </div>
    `;
  }
}
