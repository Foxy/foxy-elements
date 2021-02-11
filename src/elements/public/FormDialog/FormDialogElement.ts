import { PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { API } from '../NucleonElement/API';
import { DialogElement } from '../../private/Dialog/index';
import { FetchEvent } from '../NucleonElement/FetchEvent';
import { NucleonElement } from '../NucleonElement/NucleonElement';
import { UpdateEvent } from '../NucleonElement/UpdateEvent';

type Template = typeof html;
type TemplateFunction = (params: {
  html: Template;
  href: string;
  lang: string;
  parent: string;
  handleFetch: (evt: Event) => void;
  handleUpdate: (evt: Event) => void;
}) => TemplateResult;

export class FormDialogElement extends DialogElement {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      href: { type: String },
      lang: { type: String },
      form: { type: String },
      parent: { type: String },
      editable: { attribute: false },
      closable: { attribute: false },
    };
  }

  parent = '';

  href = '';

  lang = '';

  private __form: string | null = null;

  private __renderForm: TemplateFunction | null = null;

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

    this.closable = !evt.detail.matches('busy');
    this.editable =
      evt.detail.matches({ idle: { template: { clean: 'valid' } } }) ||
      evt.detail.matches({ idle: { template: { dirty: 'valid' } } }) ||
      evt.detail.matches({ idle: { snapshot: { dirty: 'valid' } } });
  };

  get form(): string | null {
    return this.__form;
  }

  set form(tagName: string | null) {
    this.__renderForm = new Function(
      'opts',
      `return opts.html\`
        <${tagName}
          id="form"
          href=\${opts.href}
          lang=\${opts.lang}
          parent=\${opts.parent}
          @fetch=\${opts.handleFetch}
          @update=\${opts.handleUpdate}
        >
        </${tagName}>\``
    ) as TemplateFunction;

    this.__form = tagName;
    this.requestUpdate();
  }

  render(): TemplateResult {
    return super.render(
      this.__renderForm?.bind(null, {
        handleUpdate: this.__handleUpdate,
        handleFetch: this.__handleFetch,
        parent: this.parent,
        href: this.href,
        lang: this.lang,
        html,
      })
    );
  }

  async save(): Promise<void> {
    const form = this.renderRoot.querySelector('#form') as NucleonElement<never>;
    form.send({ type: 'SUBMIT' });
  }
}
