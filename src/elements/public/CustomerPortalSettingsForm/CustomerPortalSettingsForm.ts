import type { TemplateResult } from 'lit-html';
import type { NucleonV8N } from '../NucleonElement/types';
import type { Item } from '../../internal/InternalEditableListControl/types';
import type { Data } from './types';

import { TranslatableMixin } from '../../../mixins/translatable';
import { BooleanSelector } from '@foxy.io/sdk/core';
import { InternalForm } from '../../internal/InternalForm/InternalForm';
import { isOrigin } from './isOrigin';
import { html } from 'lit-html';

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
      // TODO remove this once SDK types are fixed
      // @ts-expect-error SDK types are incorrect
      ({ jwtSharedSecret: v }) => {
        return !v || /^[a-z0-9-]+$/.test(v) || 'jwt-shared-secret:v8n_invalid';
      },
      // TODO remove this once SDK types are fixed
      // @ts-expect-error SDK types are incorrect
      ({ jwtSharedSecret: v }) => {
        return !v || v.length >= 40 || 'jwt-shared-secret:v8n_too_short';
      },
      // TODO remove this once SDK types are fixed
      // @ts-expect-error SDK types are incorrect
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
    return this.form.allowedOrigins?.map(value => ({ value }));
  };

  private readonly __allowedOriginsSetValue = (newValue: Item[]) => {
    this.edit({
      allowedOrigins: newValue
        .filter(({ value }) => isOrigin(value))
        .map(({ value }) => value.toLowerCase()),
    });
  };

  private readonly __featuresOptions = [
    { value: 'sso', label: 'option_sso' },
    { value: 'sign-up', label: 'option_sign_up' },
    { value: 'frequency-modification', label: 'option_frequency_modification' },
    { value: 'next-date-modification', label: 'option_next_date_modification' },
  ];

  private readonly __featuresGetValue = () => {
    const features: string[] = [];

    if (this.form.sso) features.push('sso');
    if (this.form.signUp?.enabled) features.push('sign-up');
    if (this.form.subscriptions?.allowNextDateModification) features.push('next-date-modification');
    if (this.form.subscriptions?.allowFrequencyModification.length) {
      features.push('frequency-modification');
    }

    return features;
  };

  private readonly __featuresSetValue = (features: string[]) => {
    const fmod = this.form.subscriptions?.allowFrequencyModification ?? [];

    this.edit({
      sso: features.includes('sso'),
      signUp: {
        enabled: features.includes('sign-up'),
        verification: this.form.signUp?.verification ?? {
          type: 'hcaptcha',
          siteKey: '',
          secretKey: '',
        },
      },
      subscriptions: {
        allowFrequencyModification: features.includes('frequency-modification')
          ? fmod.length === 0
            ? [{ jsonataQuery: '*', values: [] }]
            : fmod
          : [],
        allowNextDateModification: features.includes('next-date-modification')
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
    const alwaysMatch = [super.hiddenSelector.toString()];

    if (!this.form.signUp?.enabled) {
      alwaysMatch.push(
        'sign-up-verification-hcaptcha-site-key',
        'sign-up-verification-hcaptcha-secret-key'
      );
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
      <foxy-internal-editable-list-control
        infer="allowed-origins"
        .getValue=${this.__allowedOriginsGetValue}
        .setValue=${this.__allowedOriginsSetValue}
      >
      </foxy-internal-editable-list-control>

      <foxy-internal-checkbox-group-control
        infer="features"
        theme="vertical"
        .getValue=${this.__featuresGetValue}
        .setValue=${this.__featuresSetValue}
        .options=${this.__featuresOptions}
      >
      </foxy-internal-checkbox-group-control>

      <foxy-internal-password-control
        infer="sign-up-verification-hcaptcha-site-key"
        .getValue=${this.__signUpVerificationHcaptchaSiteKeyGetValue}
        .setValue=${this.__signUpVerificationHcaptchaSiteKeySetValue}
      >
      </foxy-internal-password-control>

      <foxy-internal-password-control
        infer="sign-up-verification-hcaptcha-secret-key"
        .getValue=${this.__signUpVerificationHcaptchaSecretKeyGetValue}
        .setValue=${this.__signUpVerificationHcaptchaSecretKeySetValue}
      >
      </foxy-internal-password-control>

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

      <foxy-internal-frequency-control
        infer="session-lifespan-in-minutes"
        max=""
        .getValue=${this.__sessionLifespanInMinutesGetValue}
        .setValue=${this.__sessionLifespanInMinutesSetValue}
        .options=${this.__sessionLifespanInMinutesOptions}
      >
      </foxy-internal-frequency-control>

      <foxy-internal-password-control
        property="jwtSharedSecret"
        infer="jwt-shared-secret"
        show-generator
        .generatorOptions=${this.__jwtSecretGeneratorOptions}
      >
      </foxy-internal-password-control>

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
