import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { Data } from './types';

import { ConfigurableMixin } from '../../../../../mixins/configurable';
import { TranslatableMixin } from '../../../../../mixins/translatable';
import { ResponsiveMixin } from '../../../../../mixins/responsive';
import { ThemeableMixin } from '../../../../../mixins/themeable';
import { NucleonElement } from '../../../NucleonElement/NucleonElement';
import { html, css } from 'lit-element';
import { classMap } from '../../../../../utils/class-map';

const Base = ResponsiveMixin(TranslatableMixin(ConfigurableMixin(ThemeableMixin(NucleonElement))));

export class InternalI18nEditorEntry extends Base<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      defaultValue: { attribute: 'default-value' },
      gateway: {},
      code: {},
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          --button-height: 1.703rem;
        }

        textarea {
          -webkit-text-fill-color: var(--lumo-body-text-color);
        }

        vaadin-button {
          height: var(--button-height);
          --lumo-primary-color-50pct: var(--lumo-success-contrast-color);
        }

        .h-bottom-bar {
          height: calc(var(--button-height) + (var(--lumo-space-xs) * 2));
        }

        .h-0 {
          height: 0;
        }
      `,
    ];
  }

  defaultValue: string | null = null;

  gateway: string | null = null;

  code: string | null = null;

  render(): TemplateResult {
    const value = this.form.custom_value ?? this.defaultValue;

    const isSnapshot = this.in({ idle: 'snapshot' });
    const isTemplate = this.in({ idle: 'template' });
    const isSnapshotDirty = this.in({ idle: { snapshot: 'dirty' } });
    const isTemplateDirty = this.in({ idle: { template: 'dirty' } });
    const isDirty = isSnapshotDirty || isTemplateDirty;

    const isDisabled = !this.in('idle') || this.disabled;
    const isReadonly = this.readonly;
    const isInteractive = !isDisabled && !isReadonly;
    const isFailed = this.in('fail');

    return html`
      <div
        class=${classMap({
          'transition-all rounded ring-1 leading-s text-secondary': true,
          'ring-contrast-10': !isFailed && (!isDirty || isReadonly),
          'ring-success': !isFailed && isDirty && !isReadonly,
          'ring-error': isFailed,
          'opacity-75': isDisabled,
          'hover-ring-contrast-20': !isFailed && !isDirty && isInteractive,
          'hover-text-body': !isFailed && isInteractive,
        })}
      >
        <label class="group flex flex-col sm-flex-row">
          <div class="flex-1 p-xs break-all" style="max-width: 20rem">
            <span class="inline-block rounded text-s p-xs font-medium">
              ${this.data?.code ?? this.code}
            </span>
          </div>

          <div class="flex-1 flex">
            <div class="relative flex-1">
              <div class="opacity-0 text-s p-s font-medium break-all">
                <span class="whitespace-pre-wrap">${value}&ZeroWidthSpace;</span>
              </div>

              <textarea
                class=${classMap({
                  'absolute inset-0 p-s resize-none': true,
                  'sm-border-l sm-border-transparent': true,
                  'break-all text-body transition-colors text-s font-medium': true,
                  'rounded-b sm-rounded-bl-none sm-rounded-tr': isTemplate && !isDirty,
                  'rounded-bl sm-rounded-bl-none': isSnapshot && !isDirty,
                  'sm-rounded-tr': isTemplate && isDirty,
                  'sm-border-contrast-10': isReadonly,
                  'bg-contrast-10': !isReadonly,
                  'group-hover-bg-contrast-20': isInteractive,
                  'focus-outline-none focus-ring-2 focus-ring-inset focus-ring-primary-50': true,
                })}
                .value=${value}
                ?disabled=${isDisabled}
                ?readonly=${isReadonly}
                @input=${(evt: InputEvent) => {
                  const textarea = evt.currentTarget as HTMLTextAreaElement;

                  if (this.gateway) this.edit({ gateway: this.gateway });
                  if (this.code) this.edit({ code: this.code });
                  this.edit({ custom_value: textarea.value });
                }}
              >
              </textarea>
            </div>

            ${isSnapshot
              ? html`
                  <button
                    class=${classMap({
                      'flex-shrink-0 w-m flex items-center justify-center': true,
                      'transition-colors text-tertiary ring-inset': true,
                      'rounded-br sm-rounded-tr': !isDirty,
                      'sm-rounded-tr': isDirty,
                      'bg-contrast-10': !isReadonly,
                      'cursor-default': !isInteractive,
                      'cursor-pointer': isInteractive,
                      'group-hover-bg-contrast-20 hover-text-body': isInteractive,
                      'focus-outline-none focus-ring-2 focus-ring-primary-50': true,
                    })}
                    title=${this.t('delete_button_title')}
                    theme="contrast icon"
                    ?disabled=${isDisabled || isReadonly}
                    @click=${() => this.delete()}
                  >
                    <iron-icon class="icon-inline text-xl" icon="icons:restore"></iron-icon>
                  </button>
                `
              : ''}
          </div>
        </label>

        <div
          class=${classMap({
            'transition-all bg-success rounded-b overflow-hidden': true,
            'flex items-center justify-end gap-xs px-xs': true,
            'h-bottom-bar': isDirty && !isReadonly,
            'h-0': !isDirty || isReadonly,
          })}
        >
          <vaadin-button
            theme="primary success small"
            ?disabled=${!isInteractive}
            @click=${() => this.undo()}
          >
            <foxy-i18n infer="" key="undo_button"></foxy-i18n>
          </vaadin-button>

          <vaadin-button
            theme="primary success small"
            ?disabled=${!isInteractive}
            @click=${() => this.submit()}
          >
            <foxy-i18n infer="" key="save_button"></foxy-i18n>
          </vaadin-button>
        </div>
      </div>
    `;
  }
}
