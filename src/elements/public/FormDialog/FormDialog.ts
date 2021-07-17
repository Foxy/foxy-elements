import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { API } from '../NucleonElement/API';
import { Dialog } from '../../private/Dialog/Dialog';
import { DialogHideEvent } from '../../private/Dialog/DialogHideEvent';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormRenderer } from './types';
import { InternalConfirmDialog } from '../../internal/InternalConfirmDialog/InternalConfirmDialog';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { UpdateEvent } from '../NucleonElement/UpdateEvent';

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
      parent: { type: String },
    };
  }

  /** Optional URL of the collection this resource belongs to (passed to form). */
  parent = '';

  group = '';

  /** Optional URL of the resource to load (passed to form). */
  href = '';

  private __form: string | null | FormRenderer = null;

  private __renderForm: FormRenderer | null = null;

  private __handleFetch = (evt: Event) => {
    if (!(evt instanceof FetchEvent)) return;

    evt.stopImmediatePropagation();
    evt.preventDefault();
    evt.respondWith(
      new API(this).fetch(evt.request).then(response => {
        const wasDeleting = evt.request.url === this.href && evt.request.method === 'DELETE';
        const wasAdding = evt.request.url === this.parent && evt.request.method === 'POST';

        if (response.ok && (wasDeleting || wasAdding)) this.open = false;
        return response;
      })
    );
  };

  private __handleUpdate = (evt: Event) => {
    if (!(evt instanceof UpdateEvent)) return;
    const target = evt.target as NucleonElement<never>;

    this.closable = !target.in('busy');
    this.editable =
      target.in({ idle: { template: { clean: 'valid' } } }) ||
      target.in({ idle: { template: { dirty: 'valid' } } }) ||
      target.in({ idle: { snapshot: { dirty: 'valid' } } });
  };

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
            ns="$\{options.dialog.ns}$\{customElements.get('${value}')?.defaultNS ?? ''}"
            href=\${options.dialog.href}
            lang=\${options.dialog.lang}
            group=\${options.dialog.group}
            parent=\${options.dialog.parent}
            disabledcontrols=\${options.dialog.disabledControls.toString()}
            readonlycontrols=\${options.dialog.readonlyControls.toString()}
            hiddencontrols=\${options.dialog.hiddenControls.toString()}
            ?disabled=\${options.dialog.disabled}
            ?readonly=\${options.dialog.readonly}
            ?hidden=\${options.dialog.hidden}
            .templates=\${options.dialog.templates}
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

      ${super.render(
        this.__renderForm?.bind(null, {
          handleUpdate: this.__handleUpdate,
          handleFetch: this.__handleFetch,
          dialog: this,
          html,
        })
      )}
    `;
  }

  async hide(cancelled = false): Promise<void> {
    if (cancelled) {
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
