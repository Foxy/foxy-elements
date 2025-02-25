import type { AvailableFraudProtections, FraudProtection } from '../types';

export type Params = {
  fraudProtections?: FraudProtection[];
  paymentPresetId: string;
  base: string;
};

export function compose(params: Params): AvailableFraudProtections {
  const { paymentPresetId: presetId, fraudProtections: fps, base } = params;
  const selfURL = new URL(`./payment_presets/${presetId}/available_fraud_protections`, base);

  const values: AvailableFraudProtections['values'] = {
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
                description: '',
                default_value: 'disabled',
                options: [
                  { name: 'Disabled', value: 'disabled' },
                  { name: 'Always enabled', value: 'enabled_always' },
                  { name: 'Enabled by errors', value: 'enabled_by_errors' },
                ],
              },
              {
                id: 'site_key',
                name: 'Site Key',
                type: 'text',
                optional: true,
                description: '',
                default_value: '',
              },
              {
                id: 'private_key',
                name: 'Secret Key',
                type: 'text',
                optional: true,
                description: '',
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
  };

  for (const type in values) {
    const fp = fps?.find(fp => fp.type === type);
    if (fp) values[type].conflict = { type: fp.type, name: fp.description };
  }

  return { _links: { self: { href: selfURL.toString() } }, values };
}
