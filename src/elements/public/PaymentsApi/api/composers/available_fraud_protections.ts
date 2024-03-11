import type { AvailableFraudProtections } from '../types';

export type Params = {
  paymentPresetId: string;
  base: string;
};

export function compose(params: Params): AvailableFraudProtections {
  const { paymentPresetId: presetId, base } = params;
  const selfURL = new URL(`./payment_presets/${presetId}/available_fraud_protections`, base);

  return {
    _links: { self: { href: selfURL.toString() } },
    values: {
      minfraud: {
        name: 'MaxMind minFraud',
        uses_rejection_threshold: true,
        json: null,
      },
      google_recaptcha: {
        name: 'Google reCAPTCHA',
        uses_rejection_threshold: false,
        json: {
          blocks: [
            {
              id: '',
              parent_id: '',
              fields: [
                {
                  id: 'config',
                  name: 'Configuration',
                  type: 'select',
                  description: 'Determines how reCAPTCHA is configured to operate.',
                  default_value: 'disabled',
                  options: [
                    { name: 'Disabled', value: 'disabled' },
                    { name: 'Always enabled', value: 'enabled_always' },
                    { name: 'Enabled by errors', value: 'enabled_by_errors' },
                  ],
                },
                {
                  id: 'private_key',
                  name: 'Private Key',
                  type: 'text',
                  optional: true,
                  description: 'If using a custom subdomain, enter your Private Key here.',
                  default_value: '',
                },
                {
                  id: 'site_key',
                  name: 'Site Key',
                  type: 'text',
                  optional: true,
                  description: 'If using a custom subdomain, enter your Site Key here.',
                  default_value: '',
                },
              ],
            },
          ],
        },
      },
      custom_precheckout_hook: {
        name: 'Pre-Checkout Webhook',
        uses_rejection_threshold: false,
        json: {
          blocks: [
            {
              id: '',
              parent_id: '',
              fields: [
                {
                  id: 'enabled',
                  name: 'Enabled',
                  type: 'checkbox',
                  default_value: false,
                },
                {
                  id: 'url',
                  name: 'URL',
                  type: 'text',
                  description: 'Url of your Pre-Checkout Hook',
                  default_value: '',
                },
                {
                  id: 'failure_handling',
                  name: 'Failure handling',
                  type: 'select',
                  description:
                    'Determines what happens to the checkout submission if your webhook fails to respond correctly.',
                  default_value: '',
                  options: [
                    { name: 'Reject', value: 'reject' },
                    { name: 'Approve', value: 'approve' },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
  };
}
