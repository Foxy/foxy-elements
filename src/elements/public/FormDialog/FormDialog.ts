import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { API } from '../NucleonElement/API';
import { Dialog } from '../../private/Dialog/Dialog';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormRenderer } from './types';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { UpdateEvent } from '../NucleonElement/UpdateEvent';
import { spread } from '@open-wc/lit-helpers';
import { BooleanSelector } from '@foxy.io/sdk/core';

/**
 * Dialog wrapper for the forms made with NucleonElement.
 *
 * @fires FormDialog#show - Instance of `FormDialog.ShowEvent`. Dispatched after dialog finishes entry transition.
 * @fires FormDialog#hide - Instance of `FormDialog.HideEvent`. Dispatched after dialog finishes exit transition.
 *
 * @element foxy-form-dialog
 * @since 1.1.0
 */
export class FormDialog extends Dialog {
  /** @readonly */
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      href: { type: String },
      form: { type: String, noAccessor: true },
      group: { type: String },
      props: { type: Object },
      parent: { type: String },
      related: { type: Array },
      closeOnPatch: { type: Boolean, attribute: 'close-on-patch' },
      keepOpenOnPost: { type: Boolean, attribute: 'keep-open-on-post' },
      keepOpenOnDelete: { type: Boolean, attribute: 'keep-open-on-delete' },
      noConfirmWhenDirty: { type: Boolean, attribute: 'no-confirm-when-dirty' },
    };
  }

  /** If true, FormDialog won't show the confirmation dialog when the form is dirty. */
  noConfirmWhenDirty = false;

  /** If true, FormDialog will automatically close after the associated form updates the resource. */
  closeOnPatch = false;

  /** If true, FormDialog won't automatically close after the associated form deletes the resource. */
  keepOpenOnDelete = false;

  /** If true, FormDialog won't automatically close after the associated form creates a resource. */
  keepOpenOnPost = false;

  /** Optional URI list of the related resources (passed to form). */
  related: string[] = [];

  /** Optional URL of the collection this resource belongs to (passed to form). */
  parent = '';

  /** Properties to set on the form element using the `spread()` helper. */
  props: Record<string, unknown> = {};

  group = '';

  /** Optional URL of the resource to load (passed to form). */
  href = '';

  private __form: string | null | FormRenderer = null;

  private __renderForm: FormRenderer | null = null;

  private __handleFetch = (evt: Event) => {
    if (!(evt instanceof FetchEvent)) return;

    evt.stopImmediatePropagation();
    evt.preventDefault();
    evt.respondWith(new API(this).fetch(evt.request));
  };

  private __handleUpdate = (evt: Event) => {
    if (!(evt instanceof UpdateEvent)) return;

    const result = evt.detail?.result;
    const Result = UpdateEvent.UpdateResult;
    const target = evt.currentTarget as NucleonElement<never>;

    if (
      (!this.keepOpenOnDelete && result === Result.ResourceDeleted) ||
      (!this.keepOpenOnPost && result === Result.ResourceCreated) ||
      (this.closeOnPatch && result === Result.ResourceUpdated && target.errors.length === 0)
    ) {
      this.open = false;
    }

    if (this.parent !== target.parent) this.parent = target.parent;
    if (this.href !== target.href) this.href = target.href;

    this.closable = !target.in('busy');
    this.editable =
      target.in({ idle: { template: { dirty: 'valid' } } }) ||
      target.in({ idle: { snapshot: { dirty: 'valid' } } });

    this.dispatchEvent(new UpdateEvent(evt.type, { detail: evt.detail }));
  };

  get hiddenSelector(): BooleanSelector {
    return new BooleanSelector(`submit undo ${super.hiddenSelector}`.trim());
  }

  /**
   * Form's custom element tag. Generated custom element will have the following attributes:
   *
   * - `parent` – same as `foxy-form-dialog[parent]`;
   * - `href` – same as `foxy-form-dialog[href]`;
   * - `lang` – same as `foxy-form-dialog[lang]`;
   */
  get form(): string | null | FormRenderer {
    return this.__form;
  }

  set form(value: string | null | FormRenderer) {
    this.__form = value;

    if (typeof value === 'string') {
      this.__renderForm = new Function(
        'options',
        `return options.html\`
          <${value}
            id="form"
            ns="$\{options.dialog.ns} $\{customElements.get('${value}')?.defaultNS ?? ''}"
            href=\${options.dialog.href}
            lang=\${options.dialog.lang}
            group=\${options.dialog.group}
            parent=\${options.dialog.parent}
            disabledcontrols=\${options.dialog.disabledSelector.toString()}
            readonlycontrols=\${options.dialog.readonlySelector.toString()}
            hiddencontrols=\${options.dialog.hiddenSelector.toString()}
            ?disabled=\${options.dialog.disabled}
            ?readonly=\${options.dialog.readonly}
            ?hidden=\${options.dialog.hidden}
            .templates=\${options.dialog.templates}
            .related=\${options.dialog.related}
            ...=$\{options.spread(options.dialog.props)}
            @fetch=\${options.handleFetch}
            @update=\${options.handleUpdate}
          >
          </${value}>\``
      ) as FormRenderer;
    } else {
      this.__renderForm = value;
    }

    this.requestUpdate();
  }

  /** @readonly */
  render(): TemplateResult {
    return html`
      <foxy-internal-confirm-dialog
        message="undo_message"
        confirm="undo_confirm"
        cancel="undo_cancel"
        header="undo_header"
        theme="error"
        lang=${this.lang}
        ns=${this.ns}
        id="confirm"
        @hide=${(evt: DialogHideEvent) => !evt.detail.cancelled && super.hide(true)}
      >
      </foxy-internal-confirm-dialog>

      ${super.render(() => {
        return html`${this.__renderForm?.({
          handleUpdate: this.__handleUpdate,
          handleFetch: this.__handleFetch,
          spread: spread,
          dialog: this,
          html,
        })}`;
      })}
    `;
  }

  async hide(cancelled = false): Promise<void> {
    if (cancelled && this.editable && !this.noConfirmWhenDirty) {
      const confirm = this.renderRoot.querySelector('#confirm') as InternalConfirmDialog;
      confirm.show();
    } else {
      return super.hide(cancelled);
    }
  }

  /** Submits the form. */
  async save(): Promise<void> {
    (this.renderRoot.querySelector('#form') as NucleonElement<never>).submit();
  }
}
