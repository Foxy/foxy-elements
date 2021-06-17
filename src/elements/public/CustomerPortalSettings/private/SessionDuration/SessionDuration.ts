import {
  CustomFieldElement,
  CustomFieldI18n,
} from '@vaadin/vaadin-custom-field/vaadin-custom-field';
import { TemplateResult, html } from 'lit-html';
import { I18N } from '../../../../private';
import { IntegerFieldElement } from '@vaadin/vaadin-text-field/vaadin-integer-field';
import { PropertyDeclarations } from 'lit-element';
import { ScopedElementsMap } from '@open-wc/scoped-elements';
import { SelectElement } from '@vaadin/vaadin-select/vaadin-select';
import { Translatable } from '../../../../../mixins/translatable';
import { classMap } from '../../../../../utils/class-map';

export class SessionDurationChangeEvent extends CustomEvent<{ value: number; invalid: boolean }> {
  constructor(detail: SessionDurationChangeEvent['detail']) {
    super('change', { detail });
  }
}

export class SessionDuration extends Translatable {
  public static get scopedElements(): ScopedElementsMap {
    return {
      'vaadin-custom-field': CustomFieldElement,
      'vaadin-integer-field': IntegerFieldElement,
      'vaadin-select': SelectElement,
      'x-i18n': I18N,
    };
  }

  public static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      disabled: { attribute: false },
      value: { attribute: false },
    };
  }

  public disabled = false;

  public value = 1;

  private __errorMessage: null | 'too_short' | 'too_long' = null;

  private __customFieldI18n: CustomFieldI18n = {
    formatValue: inputValues => {
      const multiplier = parseInt(inputValues[0] as string);
      if (isNaN(multiplier)) return '0';

      const units = inputValues[1] as string;
      if (units === 'w') return (multiplier * 10080).toFixed(0);
      if (units === 'd') return (multiplier * 1440).toFixed(0);
      if (units === 'h') return (multiplier * 60).toFixed(0);

      return multiplier.toFixed(0);
    },

    parseValue: fieldValue => {
      const value = parseInt(fieldValue);

      if (value % 10080 === 0) return [(value / 10080).toFixed(0), 'w'];
      if (value % 1440 === 0) return [(value / 1440).toFixed(0), 'd'];
      if (value % 60 === 0) return [(value / 60).toFixed(0), 'h'];

      return [value.toFixed(0), 'm'];
    },
  };

  private __renderer = this.__renderItems.bind(this);

  public render(): TemplateResult {
    return html`
      <div class="text-xs text-tertiary font-lumo">
        <vaadin-custom-field
          ?disabled=${this.disabled || !this._isI18nReady}
          .label=${this._isI18nReady ? this._t('session.title').toString() : '---'}
          .value=${this._isI18nReady ? this.value.toString() : ''}
          .i18n=${this.__customFieldI18n}
          data-testid="field"
          id="field"
          @change=${this.__handleChange}
        >
          <vaadin-integer-field
            .disabled=${this.disabled || !this._isI18nReady}
            .min=${1}
            data-testid="count"
            has-controls
          >
          </vaadin-integer-field>

          <vaadin-select
            .disabled=${this.disabled || !this._isI18nReady}
            .renderer=${this._isI18nReady ? this.__renderer : null}
            data-testid="units"
          >
          </vaadin-select>
        </vaadin-custom-field>

        <br />

        <x-i18n
          .lang=${this.lang}
          .ns=${this.ns}
          .key=${this._t(`session.${this.__errorMessage ?? 'subtitle'}`).toString()}
          data-testid="error"
          class=${classMap({ 'text-error': this.__errorMessage !== null && !this.disabled })}
        >
        </x-i18n>
      </div>
    `;
  }

  public firstUpdated(): void {
    // for some weird reason setting the value once during the initial render is not enough
    (this.shadowRoot!.getElementById('field') as CustomFieldElement).value = this.value.toString();
  }

  public updated(changedProperties: Map<keyof SessionDuration, unknown>): void {
    if (changedProperties.has('value')) this.__reportValidity();
  }

  private __renderItems(root: HTMLElement) {
    let list = root.querySelector('vaadin-list-box');

    /* istanbul ignore else (depends on vaadin-select implementation) */
    if (list === null) {
      list = document.createElement('vaadin-list-box');
      root.appendChild(list);
    }

    const items = ['m', 'h', 'd', 'w'];
    const labels = ['minute_plural', 'hour_plural', 'd_plural', 'w_plural'];
    const renderedItems = list.querySelectorAll('vaadin-item');

    for (let i = 0; i < Math.max(items.length, renderedItems.length); ++i) {
      /* istanbul ignore else (depends on vaadin-select implementation) */
      if (items[i]) {
        let item: Element;

        /* istanbul ignore if (depends on vaadin-select implementation) */
        if (renderedItems[i]) {
          item = renderedItems[i];
        } else {
          item = document.createElement('vaadin-item');
          list.appendChild(item);
        }

        (item as HTMLInputElement).value = items[i];
        item.textContent = this._t(labels[i]);
      } else {
        renderedItems[i].remove();
      }
    }
  }

  private __handleChange(evt: CustomEvent<void>) {
    evt.stopPropagation();
    this.value = parseInt((evt.target as CustomFieldElement).value as string);
    this.dispatchEvent(
      new SessionDurationChangeEvent({
        value: this.value,
        invalid: !this.__reportValidity(),
      })
    );
  }

  private __reportValidity() {
    this.__errorMessage = this.value < 1 ? 'too_short' : this.value > 40320 ? 'too_long' : null;
    this.requestUpdate();
    return this.__errorMessage === null;
  }
}
