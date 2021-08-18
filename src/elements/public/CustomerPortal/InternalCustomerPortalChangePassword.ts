import { FormRenderer, FormRendererContext } from '../FormDialog/types';
import { LitElement, PropertyDeclarations, TemplateResult, html } from 'lit-element';

import { API } from '../NucleonElement/API';
import { ButtonElement } from '@vaadin/vaadin-button';
import { FormDialog } from '../FormDialog/FormDialog';
import { ResponsiveMixin } from '../../../mixins/responsive';
import { SignInForm } from '../SignInForm/SignInForm';
import { Data as SignInFormData } from '../SignInForm/types';
import { ThemeableMixin } from '../../../mixins/themeable';
import { TranslatableMixin } from '../../../mixins/translatable';

const enum Steps {
  CurrentPassword = 1,
  NewPassword = 2,
  Done = 3,
}

const Base = ResponsiveMixin(ThemeableMixin(TranslatableMixin(LitElement)));

type UpdateEvent = InstanceType<typeof SignInForm.UpdateEvent>;
type FetchEvent = InstanceType<typeof SignInForm.API.FetchEvent>;

export class InternalCustomerPortalChangePassword extends Base {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      isErrorVisible: { attribute: false },
      disabled: { type: Boolean },
      customer: { type: String },
      session: { type: String },
      email: { type: String },
      step: { attribute: false },
      fail: { attribute: false },
    };
  }

  isErrorVisible = false;

  disabled = false;

  customer = '';

  session = '';

  email = '';

  step = Steps.CurrentPassword;

  private readonly __handleTriggerClick = (evt: CustomEvent<void>) => {
    const button = evt.currentTarget as ButtonElement;
    const dialog = this.renderRoot.querySelector('#dialog') as FormDialog;

    this.isErrorVisible = false;
    this.step = Steps.CurrentPassword;

    dialog.show(button);
  };

  private readonly __handleSignInFormUpdate = (evt: UpdateEvent, ctx: FormRendererContext) => {
    ctx.handleUpdate(evt);

    const target = evt.currentTarget as SignInForm;
    if (target.form.credential?.email || !this.email) return;

    target.edit({
      type: target.form.type ?? 'password',
      credential: {
        email: this.email,
        password: target.form.credential?.password ?? '',
      },
    });
  };

  private readonly __handleSignInFormFetch = (evt: FetchEvent) => {
    if (evt.defaultPrevented) return;
    if (evt.request.method !== 'POST') return;
    if (evt.request.url !== this.session) return;

    evt.preventDefault();
    evt.stopImmediatePropagation();
    evt.respondWith(this.__getResponse(evt.request));
  };

  private readonly __renderSignInForm: FormRenderer = ctx => {
    const readonlyControls: string[] = [];
    const hiddenControls: string[] = ['email'];

    let background = 'bg-primary-10';
    let foreground = 'text-primary';
    let icon = 'icons:lock-outline';
    let slot = 'password:before';

    if (this.step === Steps.NewPassword) {
      hiddenControls.push('password');
      slot = 'new-password:before';
      icon = 'icons:lock-open';
    }

    if (this.step === Steps.Done) {
      readonlyControls.push('new-password');
      hiddenControls.push('password', 'submit');
      background = 'bg-success-10';
      foreground = 'text-success';
      slot = 'new-password:before';
      icon = 'icons:done-all';
    }

    if (!this.isErrorVisible) hiddenControls.push('error');

    return html`
      <foxy-sign-in-form
        readonlycontrols=${readonlyControls.join(' ')}
        hiddencontrols=${hiddenControls.join(' ')}
        parent=${this.session}
        class="mt-s sm-w-narrow-modal"
        lang=${ctx.dialog.lang}
        ns=${ctx.dialog.ns}
        @update=${(evt: UpdateEvent) => this.__handleSignInFormUpdate(evt, ctx)}
        @fetch=${this.__handleSignInFormFetch}
      >
        <div class="mx-auto flex mb-m w-l h-l rounded-t-l rounded-b-l ${background}" slot=${slot}>
          <iron-icon icon=${icon} class="m-auto ${foreground}"></iron-icon>
        </div>

        <foxy-i18n
          class="block text-center text-m text-secondary leading-m mb-m"
          lang=${ctx.dialog.lang}
          slot=${slot}
          key="change_password_step_${this.step}"
          ns=${ctx.dialog.ns}
        >
        </foxy-i18n>
      </foxy-sign-in-form>
    `;
  };

  render(): TemplateResult {
    return html`
      <foxy-form-dialog
        hiddencontrols="save-button"
        header="change_password"
        lang=${this.lang}
        ns=${this.ns}
        alert
        id="dialog"
        .form=${this.__renderSignInForm}
      >
      </foxy-form-dialog>

      <vaadin-button class="w-full" ?disabled=${this.disabled} @click=${this.__handleTriggerClick}>
        <foxy-i18n lang=${this.lang} key="change_password" ns=${this.ns}></foxy-i18n>
      </vaadin-button>
    `;
  }

  private async __getResponse(request: Request): Promise<Response> {
    const json = (await request.clone().json()) as SignInFormData;
    const api = new API(this);

    this.isErrorVisible = false;

    if (this.step === Steps.CurrentPassword) {
      const response = await api.fetch(request.url, {
        method: request.method,
        body: JSON.stringify(json),
      });

      if (response.ok) {
        this.step = Steps.NewPassword;
        const body = { _embedded: { 'fx:errors': [{ code: 'new_password_required_error' }] } };
        return new API.WHATWGResponse(JSON.stringify(body), { status: 400 });
      } else {
        this.isErrorVisible = true;
        return response;
      }
    }

    if (this.step === Steps.NewPassword) {
      const response = await api.fetch(this.customer, {
        method: 'PATCH',
        body: JSON.stringify({
          password: json.credential.new_password,
          password_old: json.credential.password,
        }),
      });

      if (response.ok) {
        this.step = Steps.Done;
        json._links = { self: { href: request.url } };
        return new API.WHATWGResponse(JSON.stringify(json));
      } else {
        this.isErrorVisible = true;
        return response;
      }
    }

    return api.fetch(request);
  }
}
