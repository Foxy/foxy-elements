import type { CSSResultArray, PropertyDeclarations, TemplateResult } from 'lit-element';
import type { GeneratorOptions } from '../../internal/InternalPasswordControl/generateRandomPassword';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Resource } from '@foxy.io/sdk/core';
import type { Graph } from '@foxy.io/sdk/customer';

import { TranslatableMixin } from '../../../mixins/translatable';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { html, css } from 'lit-element';

import checkPasswordStrength from 'check-password-strength';
const passwordStrength = checkPasswordStrength.passwordStrength;

type Data = Resource<
  Graph & {
    props: {
      /** When updating the password using Customer API, these values are required to complete the request. */
      password_old?: string;
      password?: string;
    };
  }
>;

export class InternalCustomerPortalPasswordResetView extends TranslatableMixin(InternalForm)<Data> {
  static get properties(): PropertyDeclarations {
    return {
      ...super.properties,
      passwordOld: { attribute: 'password-old' },
    };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        .max-w-25rem {
          max-width: 25rem;
        }
      `,
    ];
  }

  static get v8n(): NucleonV8N<Data> {
    return [
      ({ password: v }) => !!v || 'password:v8n_required',
      ({ password: v }) => !v || v.length <= 50 || 'password:v8n_too_long',
      ({ password: v }) => !v || passwordStrength(v).id >= 2 || 'password:v8n_too_weak',
    ];
  }

  passwordOld: string | null = null;

  private readonly __generatorOptions: GeneratorOptions = {
    checkStrength: value => passwordStrength(value).id >= 2,
  };

  renderBody(): TemplateResult {
    return html`
      <div class="m-auto max-w-25rem leading-s">
        <p class="text-xxl font-medium ${this.in('busy') ? 'text-disabled' : 'text-body'}">
          <foxy-i18n infer="" key="title"></foxy-i18n>
        </p>

        <p class="text-l ${this.in('busy') ? 'text-disabled' : 'text-secondary'}">
          <foxy-i18n infer="" key="subtitle"></foxy-i18n>
        </p>

        <foxy-internal-password-control
          infer="password"
          class="mt-m"
          show-generator
          .generatorOptions=${this.__generatorOptions}
        >
        </foxy-internal-password-control>

        <vaadin-button
          class="w-full mt-l"
          theme="primary"
          ?disabled=${this.disabled || !this.in('idle')}
          @click=${() => this.submit()}
        >
          <foxy-i18n infer="" key="submit"></foxy-i18n>
        </vaadin-button>

        <vaadin-button
          class="w-full mt-s"
          theme="tertiary"
          ?disabled=${this.disabled || !this.in('idle')}
          @click=${() => this.dispatchEvent(new CustomEvent('skip'))}
        >
          <foxy-i18n infer="" key="skip"></foxy-i18n>
        </vaadin-button>
      </div>
    `;
  }

  submit(): void {
    this.edit({ password_old: this.passwordOld ?? '' });
    super.submit();
  }

  protected async _fetch<TResult = Data>(...args: Parameters<Window['fetch']>): Promise<TResult> {
    const request = new Request(...args);
    if (request.method !== 'PATCH') return super._fetch<TResult>(...args);

    const body = await request.json();
    const data = await super._fetch<Data>(...args);

    data.password_old = body.password_old;
    data.password = body.password;

    return data as unknown as TResult;
  }
}
