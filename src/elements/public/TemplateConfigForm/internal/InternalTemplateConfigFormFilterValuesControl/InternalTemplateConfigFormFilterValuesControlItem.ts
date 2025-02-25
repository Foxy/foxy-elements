import type { PropertyDeclarations } from 'lit-element';
import type { TemplateResult } from 'lit-html';

import { InternalControl } from '../../../../internal/InternalControl/InternalControl';
import { classMap } from '../../../../../utils/class-map';
import { html } from 'lit-html';

export class InternalTemplateConfigFormFilterValuesControlItem extends InternalControl {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      __newRegion: { attribute: false },
      options: { type: Object },
      regions: { type: Array },
      name: { type: String },
      code: { type: String },
    };
  }

  options: Record<string, { n: string; c: string }> = {};

  regions: string[] = [];

  name = '';

  code = '';

  private __newRegion = '';

  render(): TemplateResult {
    const options = Object.values(this.options);
    const filteredOptions = options.filter(region => !this.regions.includes(region.c));

    return html`
      <div
        class=${classMap({
          'border border-contrast-5 rounded-s font-medium overflow-hidden': true,
          'text-disabled': this.disabled,
        })}
      >
        <div data-testid="country" class="h-m flex justify-between items-center bg-contrast-5">
          <div style="padding: calc(0.625em + (var(--lumo-border-radius) / 4) - 1px)">
            <span>${this.name || this.code}</span>
          </div>

          <button
            aria-label=${this.t('delete')}
            class=${classMap({
              'mr-xs items-center justify-center rounded-full transition-colors': true,
              'hover-bg-error-10 hover-text-error': !this.disabled,
              'focus-outline-none focus-ring-2 ring-inset ring-error-50': !this.disabled,
              'cursor-default': this.disabled,
              'flex': !this.readonly,
              'hidden': this.readonly,
            })}
            style="width: calc(var(--lumo-size-s) - 2px); height: calc(var(--lumo-size-s) - 2px)"
            ?disabled=${this.disabled}
            @click=${() => this.dispatchEvent(new CustomEvent('delete'))}
          >
            <iron-icon icon="icons:close" class="icon-inline text-m"></iron-icon>
          </button>
        </div>

        ${options.length === 0
          ? ''
          : html`
              <div data-testid="regions" class="flex flex-wrap p-xs text-s">
                ${this.regions.map(region => {
                  return html`
                    <div class="flex items-center rounded-s border border-contrast-10 h-s m-xs">
                      <span class="mx-s">${this.options[region]?.n || region}</span>

                      <button
                        aria-label=${this.t('delete')}
                        class=${classMap({
                          'items-center justify-center rounded-s transition-colors': true,
                          'hover-bg-error-10 hover-text-error': !this.disabled,
                          'focus-outline-none focus-ring-2 ring-inset ring-primary-50':
                            !this.disabled,
                          'cursor-default': this.disabled,
                          'flex': !this.readonly,
                          'hidden': this.readonly,
                        })}
                        style="width: calc(var(--lumo-size-s) - 2px); height: calc(var(--lumo-size-s) - 2px)"
                        ?disabled=${this.disabled}
                        @click=${() => {
                          this.regions = this.regions.filter(value => value !== region);
                          this.dispatchEvent(new CustomEvent('update:regions'));
                        }}
                      >
                        <iron-icon icon="icons:close" class="icon-inline text-m"></iron-icon>
                      </button>
                    </div>
                  `;
                })}
                ${filteredOptions.length === 0
                  ? ''
                  : html`
                      <div
                        data-testid="new-region"
                        class=${classMap({
                          'h-s m-xs items-center transition-colors border border-contrast-10 rounded-s':
                            true,
                          'focus-within-ring-1 ring-primary-50 focus-within-border-primary-50':
                            !this.disabled,
                          'flex': !this.readonly,
                          'hidden': this.readonly,
                        })}
                      >
                        <select
                          class=${classMap({
                            'appearance-none bg-transparent h-s text-s px-s font-medium': true,
                            'transition-colors rounded-s focus-outline-none': true,
                            'cursor-pointer hover-bg-contrast-5': !this.disabled,
                          })}
                          ?disabled=${this.disabled}
                          @change=${(evt: Event) => {
                            const target = evt.currentTarget as HTMLSelectElement;
                            this.__newRegion = target.value;
                            this.__addRegion();
                            target.value = '';
                          }}
                        >
                          <option value="" disabled selected>${this.t('add_region')}</option>
                          ${filteredOptions.map(
                            region => html`<option value=${region.c}>${region.n}</option>`
                          )}
                        </select>
                      </div>
                    `}
              </div>
            `}
      </div>
    `;
  }

  private __addRegion() {
    this.regions = [...new Set([...this.regions, this.__newRegion])];
    this.__newRegion = '';
    this.dispatchEvent(new CustomEvent('update:regions'));
  }
}
