import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Item } from '../../internal/InternalEditableListControl/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { isOrigin } from './isOrigin';
import { html } from 'lit-html';
import { toOrigin } from './toOrigin';

const NS = 'customer-portal-settings-form';
const Base = TranslatableMixin(InternalForm, NS);

/**
 * Form element for editing `fx:customer_portal_settings` resources.
 *
 * @element foxy-customer-portal-settings-form
 * @since 1.27.0
 */
export class CustomerPortalSettingsForm extends Base<Data> {
  static get v8n(): NucleonV8N<Data> {
    return [
      ({ sessionLifespanInMinutes: v }) => {
        return typeof v !== 'number' || v <= 40320 || 'session-lifespan-in-minutes:v8n_too_long';
      },
      ({ allowedOrigins: v = [] }) => {
        return v.length <= 10 || 'allowed-origins:v8n_too_many';
      },
      ({ allowedOrigins: v = [] }) => {
        return v.every(isOrigin) || 'allowed-origins:v8n_invalid';
      },
      ({ jwtSharedSecret: v }) => {
        return !v || /^[a-z0-9-]+$/.test(v) || 'jwt-shared-secret:v8n_invalid';
      },
      ({ jwtSharedSecret: v }) => {
        return !v || v.length >= 40 || 'jwt-shared-secret:v8n_too_short';
      },
      ({ jwtSharedSecret: v }) => {
        return !v || v.length <= 100 || 'jwt-shared-secret:v8n_too_long';
      },
      ({ signUp }) => {
        const v = signUp?.verification.siteKey;
        return !v || v.length <= 100 || 'sign-up-verification-hcaptcha-site-key:v8n_too_long';
      },
      ({ signUp }) => {
        const v = signUp?.verification.secretKey;
        return !v || v.length <= 100 || 'sign-up-verification-hcaptcha-secret-key:v8n_too_long';
      },
    ];
  }

  private readonly __sessionLifespanInMinutesOptions = [
    { value: 'm', label: 'option_minute' },
    { value: 'h', label: 'option_hour' },
    { value: 'd', label: 'option_day' },
    { value: 'w', label: 'option_week' },
  ];

  private readonly __sessionLifespanInMinutesGetValue = () => {
    const minutes = this.form.sessionLifespanInMinutes ?? 0;
    if (minutes % 10080 === 0) return `${minutes / 10080}w`;
    if (minutes % 1440 === 0) return `${minutes / 1440}d`;
    if (minutes % 60 === 0) return `${minutes / 60}h`;
    return `${minutes}m`;
  };

  private readonly __sessionLifespanInMinutesSetValue = (newValue: string) => {
    const numericValue = parseInt(newValue);

    if (newValue.endsWith('w')) {
      this.edit({ sessionLifespanInMinutes: numericValue * 10080 });
    } else if (newValue.endsWith('d')) {
      this.edit({ sessionLifespanInMinutes: numericValue * 1440 });
    } else if (newValue.endsWith('h')) {
      this.edit({ sessionLifespanInMinutes: numericValue * 60 });
    } else {
      this.edit({ sessionLifespanInMinutes: numericValue });
    }
  };

  private readonly __allowedOriginsGetValue = () => {
    return this.form.allowedOrigins?.map(value => ({
      label: isOrigin(value) ? value : `⚠️ ${value}`,
      value,
    }));
  };

  private readonly __allowedOriginsSetValue = (newValue: Item[]) => {
    this.edit({
      allowedOrigins: newValue
        .map(({ value }) => toOrigin(value))
        .filter((v, i, a) => a.indexOf(v) === i),
    });
  };

  private readonly __ssoGetValue = () => {
    return this.form.sso ?? false;
  };

  private readonly __ssoSetValue = (value: boolean) => {
    this.edit({ sso: value });
  };

  private readonly __signUpGetValue = () => {
    return this.form.signUp?.enabled ?? false;
  };

  private readonly __signUpSetValue = (value: boolean) => {
    this.edit({
      signUp: {
        enabled: value,
        verification: this.form.signUp?.verification ?? {
          type: 'hcaptcha',
          siteKey: '',
          secretKey: '',
        },
      },
    });
  };

  private readonly __frequencyModificationGetValue = () => {
    return (this.form.subscriptions?.allowFrequencyModification.length ?? 0) > 0;
  };

  private readonly __frequencyModificationSetValue = (value: boolean) => {
    const fmod = this.form.subscriptions?.allowFrequencyModification ?? [];

    this.edit({
      subscriptions: {
        allowFrequencyModification: value
          ? fmod.length === 0
            ? [{ jsonataQuery: '*', values: [] }]
            : fmod
          : [],
        allowNextDateModification: this.form.subscriptions?.allowNextDateModification ?? false,
      },
    });
  };

  private readonly __nextDateModificationGetValue = () => {
    return this.form.subscriptions?.allowNextDateModification ?? false;
  };

  private readonly __nextDateModificationSetValue = (value: boolean) => {
    const fmod = this.form.subscriptions?.allowFrequencyModification ?? [];

    this.edit({
      subscriptions: {
        allowFrequencyModification: fmod,
        allowNextDateModification: value
          ? this.form.subscriptions?.allowNextDateModification || []
          : false,
      },
    });
  };

  private readonly __signUpVerificationHcaptchaSiteKeyGetValue = () => {
    return this.form.signUp?.verification?.siteKey ?? '';
  };

  private readonly __signUpVerificationHcaptchaSiteKeySetValue = (newValue: string) => {
    this.edit({
      signUp: {
        enabled: !!this.form.signUp?.enabled,
        verification: {
          secretKey: this.form.signUp?.verification?.secretKey ?? '',
          siteKey: newValue,
          type: 'hcaptcha',
        },
      },
    });
  };

  private readonly __signUpVerificationHcaptchaSecretKeyGetValue = () => {
    return this.form.signUp?.verification?.secretKey ?? '';
  };

  private readonly __signUpVerificationHcaptchaSecretKeySetValue = (newValue: string) => {
    this.edit({
      signUp: {
        enabled: !!this.form.signUp?.enabled,
        verification: {
          secretKey: newValue,
          siteKey: this.form.signUp?.verification?.siteKey ?? '',
          type: 'hcaptcha',
        },
      },
    });
  };

  private readonly __jwtSecretGeneratorOptions = {
    charset: 'abcdefghijklmnopqrstuvwxyz0123456789',
    length: 64,
  };

  get hiddenSelector(): BooleanSelector {
    const alwaysMatch = ['header:copy-id', super.hiddenSelector.toString()];

    if (!this.form.signUp?.enabled) {
      alwaysMatch.push('hcaptcha');
    }

    if (!this.form.subscriptions?.allowFrequencyModification.length) {
      alwaysMatch.push('subscriptions-allow-frequency-modification');
    }

    if (!this.form.subscriptions?.allowNextDateModification) {
      alwaysMatch.push('subscriptions-allow-next-date-modification');
    }

    return new BooleanSelector(alwaysMatch.join(' ').trim());
  }

  renderBody(): TemplateResult {
    return html`
      ${this.renderHeader()}

      <foxy-internal-editable-list-control
        infer="allowed-origins"
        .getValue=${this.__allowedOriginsGetValue}
        .setValue=${this.__allowedOriginsSetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-summary-control infer="features">
        <foxy-internal-switch-control
          infer="sso"
          .getValue=${this.__ssoGetValue}
          .setValue=${this.__ssoSetValue}
        ></foxy-internal-switch-control>

        <foxy-internal-switch-control
          infer="sign-up"
          .getValue=${this.__signUpGetValue}
          .setValue=${this.__signUpSetValue}
        >
        </foxy-internal-switch-control>

        <foxy-internal-switch-control
          infer="frequency-modification"
          .getValue=${this.__frequencyModificationGetValue}
          .setValue=${this.__frequencyModificationSetValue}
        >
        </foxy-internal-switch-control>

        <foxy-internal-switch-control
          infer="next-date-modification"
          .getValue=${this.__nextDateModificationGetValue}
          .setValue=${this.__nextDateModificationSetValue}
        >
        </foxy-internal-switch-control>
      </foxy-internal-summary-control>

      <foxy-internal-summary-control infer="hcaptcha">
        <foxy-internal-password-control
          layout="summary-item"
          infer="sign-up-verification-hcaptcha-site-key"
          .getValue=${this.__signUpVerificationHcaptchaSiteKeyGetValue}
          .setValue=${this.__signUpVerificationHcaptchaSiteKeySetValue}
        >
        </foxy-internal-password-control>

        <foxy-internal-password-control
          layout="summary-item"
          infer="sign-up-verification-hcaptcha-secret-key"
          .getValue=${this.__signUpVerificationHcaptchaSecretKeyGetValue}
          .setValue=${this.__signUpVerificationHcaptchaSecretKeySetValue}
        >
        </foxy-internal-password-control>
      </foxy-internal-summary-control>

      <foxy-internal-async-list-control
        first="foxy://${this.virtualHost}/form/subscriptions/allowFrequencyModification"
        infer="subscriptions-allow-frequency-modification"
        limit="20"
        form="foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-form"
        item="foxy-internal-customer-portal-settings-form-subscriptions-allow-frequency-modification-rule-card"
        alert
      >
      </foxy-internal-async-list-control>

      <foxy-internal-async-list-control
        first="foxy://${this.virtualHost}/form/subscriptions/allowNextDateModification"
        infer="subscriptions-allow-next-date-modification"
        limit="20"
        form="foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-form"
        item="foxy-internal-customer-portal-settings-form-subscriptions-allow-next-date-modification-rule-card"
        alert
      >
      </foxy-internal-async-list-control>

      <foxy-internal-summary-control infer="security">
        <foxy-internal-frequency-control
          layout="summary-item"
          infer="session-lifespan-in-minutes"
          max=""
          .getValue=${this.__sessionLifespanInMinutesGetValue}
          .setValue=${this.__sessionLifespanInMinutesSetValue}
          .options=${this.__sessionLifespanInMinutesOptions}
        >
        </foxy-internal-frequency-control>

        <foxy-internal-password-control
          layout="summary-item"
          property="jwtSharedSecret"
          infer="jwt-shared-secret"
          show-generator
          .generatorOptions=${this.__jwtSecretGeneratorOptions}
        >
        </foxy-internal-password-control>
      </foxy-internal-summary-control>

      ${super.renderBody()}
    `;
  }

  protected async _sendPost(edits: Partial<Data>): Promise<Data> {
    this.__removeNullProperties(edits);
    return super._sendPost(edits);
  }

  protected async _sendPatch(edits: Partial<Data>): Promise<Data> {
    this.__removeNullProperties(edits);
    return super._sendPatch(edits);
  }

  private __removeNullProperties(edits: Partial<Data>): void {
    if (typeof edits.subscriptions?.allowNextDateModification === 'object') {
      edits.subscriptions?.allowNextDateModification.forEach(rule => {
        for (const key in rule) {
          const typedKey = key as keyof typeof rule;
          if (rule[typedKey] === null) delete rule[typedKey];
        }
      });
    }
  }
}
