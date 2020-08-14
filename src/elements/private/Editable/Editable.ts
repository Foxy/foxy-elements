import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { css, CSSResultArray, property } from 'lit-element';
import { html, TemplateResult } from 'lit-html';
import { Translatable } from '../../../mixins/translatable';

export class EditableDeleteEvent extends CustomEvent<void> {
  constructor() {
    super('delete');
  }
}

export class Editable extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'iron-icon': customElements.get('iron-icon'),
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .top-left-m {
          top: 0;
          left: 0;
          margin-top: calc(0px - (var(--lumo-size-s) / 2));
          margin-left: calc(0px - (var(--lumo-size-s) / 2));
        }
      `,
    ];
  }

  @property({ type: Boolean })
  public editable = false;

  public render(): TemplateResult {
    const editable = this.editable;
    const transition = 'transition duration-200';
    const actionScale = editable ? 'scale-100' : 'scale-0';
    const action = `${transition} ${actionScale} transform absolute w-s h-s rounded-full text-body border border-contrast-10 bg-base focus:outline-none`;

    return html`
      <div class="group relative font-lumo text-tertiary">
        <slot></slot>

        <button
          ?disabled=${!editable}
          class="${action} top-left-m focus:shadow-outline-error focus:border-error hover:border-error hover:text-error"
          @click=${() => this.dispatchEvent(new EditableDeleteEvent())}
        >
          <iron-icon icon="lumo:cross"></iron-icon>
        </button>
      </div>
    `;
  }
}
