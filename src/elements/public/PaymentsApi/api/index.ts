import {
  handle as handleAvailablePaymentMethods,
  Params as AvailablePaymentMethodsParams,
} from './handlers/available_payment_methods';

import {
  handle as handleAvailableFraudProtections,
  Params as AvailableFraudProtectionsParams,
} from './handlers/available_fraud_protections';

import {
  handle as handleFraudProtections,
  Params as FraudProtectionsParams,
} from './handlers/fraud_protections';

import {
  handle as handleFraudProtection,
  Params as FraudProtectionParams,
} from './handlers/fraud_protection';

import {
  handle as handlePaymentMethods,
  Params as PaymentMethodsParams,
} from './handlers/payment_methods';

import {
  handle as handlePaymentPresets,
  Params as PaymentPresetsParams,
} from './handlers/payment_presets';

import {
  handle as handlePaymentPreset,
  Params as PaymentPresetParams,
} from './handlers/payment_preset';

import {
  handle as handlePaymentMethod,
  Params as PaymentMethodParams,
} from './handlers/payment_method';

export type Handler = () => Promise<Response>;

export type Params = AvailablePaymentMethodsParams &
  AvailableFraudProtectionsParams &
  FraudProtectionsParams &
  FraudProtectionParams &
  PaymentMethodsParams &
  PaymentPresetsParams &
  PaymentPresetParams &
  PaymentMethodParams;

export function getHandler(params: Params): Promise<Response> | null {
  const paths = [
    [/\/payment_presets\/(?<presetId>.+)\/payment_methods\/(?<methodId>.+)/, handlePaymentMethod],
    [
      /\/payment_presets\/(?<presetId>.+)\/available_fraud_protections/,
      handleAvailableFraudProtections,
    ],
    [
      /\/payment_presets\/(?<presetId>.+)\/available_payment_methods/,
      handleAvailablePaymentMethods,
    ],
    [
      /\/payment_presets\/(?<presetId>.+)\/fraud_protections\/(?<protectionId>.+)/,
      handleFraudProtection,
    ],
    [/\/payment_presets\/(?<presetId>.+)\/fraud_protections/, handleFraudProtections],
    [/\/payment_presets\/(?<presetId>.+)\/payment_methods/, handlePaymentMethods],
    [/\/payment_presets\/(?<presetId>.+)/, handlePaymentPreset],
    [/\/payment_presets/, handlePaymentPresets],
  ] as const;

  for (const [pathRegex, handler] of paths) {
    if (pathRegex.test(new URL(params.request.url).pathname)) return handler(params);
  }

  return null;
}
