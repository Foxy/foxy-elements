import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { API } from '../NucleonElement/API';
import { Dialog } from '../../private';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { FormRenderer } from './types';
import { NucleonElement } from '../NucleonElement';
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
      parent: { type: String },
    };
  }

  /** Optional URL of the collection this resource belongs to (passed to form). */
  parent = '';

  /** Optional URL of the resource to load (passed to form). */
  href = '';

  private __form: string | null = null;

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
  get form(): string | null {
    return this.__form;
  }

  set form(tagName: string | null) {
    this.__renderForm = new Function(
      'options',
      `return options.html\`
        <${tagName}
          id="form"
          href=\${options.href}
          lang=\${options.lang}
          parent=\${options.parent}
          @fetch=\${options.handleFetch}
          @update=\${options.handleUpdate}
        >
        </${tagName}>\``
    ) as FormRenderer;

    this.__form = tagName;
    this.requestUpdate();
  }

  /** @readonly */
  render(): TemplateResult {
    return super.render(
      this.__renderForm?.bind(null, {
        handleFetch: this.__handleFetch,
        handleUpdate: this.__handleUpdate,
        href: this.href,
        html,
        lang: this.lang,
        parent: this.parent,
      })
    );
  }

  /** Submits the form and closes the dialog. */
  async save(): Promise<void> {
    (this.renderRoot.querySelector('#form') as NucleonElement<never>).submit();
  }
}
