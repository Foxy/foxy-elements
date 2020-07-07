import '@vaadin/vaadin-checkbox';
import { property, html } from 'lit-element';
import { Themeable } from '../../mixins/themeable';

export class Checkbox extends Themeable {
  public static get scopedElements() {
    return {
      'vaadin-checkbox': customElements.get('vaadin-checkbox'),
    };
  }

  @property({ type: Boolean })
  public checked = false;

  @property({ type: Boolean })
  public disabled = false;

  public render() {
    return html`
      <vaadin-checkbox
        class="w-full"
        style="margin-left: -3px"
        ?checked=${this.checked}
        ?disabled=${this.disabled}
        @change=${(evt: InputEvent) => {
          evt.stopPropagation();
          this.dispatchEvent(new CustomEvent('change'));
        }}
      >
        <div style="padding-left: 0.5rem">
          <slot></slot>
        </div>
      </vaadin-checkbox>

      <div style="padding-left: 2.2rem">
        <slot name="content"></slot>
      </div>
    `;
  }
}
