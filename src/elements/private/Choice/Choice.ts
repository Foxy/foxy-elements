import { spread } from '@open-wc/lit-helpers/src/spread';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import '@vaadin/vaadin-checkbox/vaadin-checkbox';
import '@vaadin/vaadin-checkbox/vaadin-checkbox-group';
import '@vaadin/vaadin-radio-button/vaadin-radio-group';
import { css, CSSResultArray, html, property, TemplateResult } from 'lit-element';
import { Themeable } from '../../../mixins/themeable';
import { ChoiceChangeEvent } from './ChoiceChangeEvent';

export class Choice extends Themeable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-checkbox-group': customElements.get('vaadin-checkbox-group'),
      'vaadin-checkbox': customElements.get('vaadin-checkbox'),
      'vaadin-radio-button': customElements.get('vaadin-radio-button'),
      'vaadin-radio-group': customElements.get('vaadin-radio-group'),
    };
  }

  public static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .ml-xxl {
          margin-left: 3rem;
        }
      `,
    ];
  }

  @property({ type: Boolean })
  public disabled = false;

  @property({ type: Array })
  public value: null | string | string[] = null;

  @property({ type: Array })
  public items: string[] = [];

  @property({ type: Object })
  public getText: (value: string) => string = v => v;

  public render(): TemplateResult {
    const multiple = Array.isArray(this.value);

    const children = html`
      ${this.items.map((item, index) => {
        const attributes = spread({
          class: 'w-full',
          value: item,
          style: 'margin-left: 0.8125rem',
          'data-testid': `item-${item}`,
          '?checked': multiple ? this.value?.includes(item) : item === this.value,
          '@keydown': multiple ? null : this.__overrideFocus,
          '@change': (evt: Event) => {
            const checked = (evt.target as HTMLInputElement).checked;
            const value = this.value;

            if (Array.isArray(value)) {
              this.value = checked ? [...value, item] : value.filter(v => v !== item);
            } else {
              this.value = checked ? item : null;
            }

            this.dispatchEvent(new ChoiceChangeEvent(this.value));
          },
        });

        const label = html`
          <div style="margin-left: 0.3125rem">
            <slot name=${`${item}-label`}>${this.getText(item)}</slot>
          </div>
        `;

        return html`
          <div class="my-s ml-xxl border-t border-contrast-10 ${index ? '' : 'hidden'}"></div>

          ${multiple
            ? html`<vaadin-checkbox ...=${attributes}>${label}</vaadin-checkbox>`
            : html`<vaadin-radio-button ...=${attributes}>${label}</vaadin-radio-button>`}

          <div class="mr-m mt-s ml-xxl">
            <slot name=${item}></slot>
          </div>

          <div class="mt-s"></div>
        `;
      })}
    `;

    const className = 'pt-s pb-0 pr-0 w-full font-lumo text-body';

    return multiple
      ? html`<vaadin-checkbox-group class=${className}>${children}</vaadin-checkbox-group>`
      : html`<vaadin-radio-group class=${className}>${children}</vaadin-radio-group>`;
  }

  private __overrideFocus(evt: KeyboardEvent) {
    if (!evt.key.startsWith('Arrow')) return;

    let target = evt.target as HTMLInputElement | null;
    const targetTagName = target!.tagName;

    evt.preventDefault();
    evt.stopImmediatePropagation();

    while (target) {
      target = (evt.key === 'ArrowUp' || evt.key === 'ArrowLeft'
        ? target.previousElementSibling
        : target.nextElementSibling) as HTMLInputElement | null;

      if (target?.tagName === targetTagName) {
        target.click();
        target.focus();
        break;
      }
    }
  }
}
