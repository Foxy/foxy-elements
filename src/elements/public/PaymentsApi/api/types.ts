import type { Rels } from '@foxy.io/sdk/backend';
import type { Graph, Resource } from '@foxy.io/sdk/core';

import type {
  CollectionGraphLinks,
  CollectionGraphProps,
} from '@foxy.io/sdk/dist/types/core/defaults';

interface PaymentPresetsRel extends Graph {
  curie: 'fx:payment_presets';
  props: CollectionGraphProps;
  links: CollectionGraphLinks<PaymentPresetsRel>;
  child: PaymentPresetRel;
}

interface PaymentPresetRel extends Graph {
  curie: 'fx:payment_preset';
  props: Omit<Rels.PaymentMethodSet['props'], 'gateway_uri'>;
  links: {
    'self': PaymentPresetRel;
    'fx:store': Rels.Store;
    'fx:payment_methods': PaymentMethodsRel;
    'fx:fraud_protections': FraudProtectionsRel;
    'fx:available_payment_methods': AvailablePaymentMethodsRel;
    'fx:available_fraud_protections': AvailableFraudProtectionsRel;
  };
}

interface PaymentMethodsRel extends Graph {
  curie: 'fx:payment_methods';
  props: CollectionGraphProps;
  links: CollectionGraphLinks<PaymentMethodsRel>;
  child: PaymentMethodRel;
}

interface PaymentMethodRel extends Graph {
  curie: 'fx:payment_method';
  props: (Rels.HostedPaymentGateway['props'] | Rels.PaymentGateway['props']) & {
    helper: (
      | Rels.PaymentGatewaysHelper
      | Rels.HostedPaymentGatewaysHelper
    )['props']['values'][string];
  };
  links: {
    'self': PaymentMethodRel;
    'fx:store': Rels.Store;
    'fx:payment_preset': any;
  };
}

interface FraudProtectionsRel extends Graph {
  curie: 'fx:fraud_protections';
  props: CollectionGraphProps;
  links: CollectionGraphLinks<FraudProtectionsRel>;
  child: FraudProtectionRel;
}

interface FraudProtectionRel extends Graph {
  curie: 'fx:fraud_protection';
  links: {
    'self': FraudProtectionRel;
    'fx:store': Rels.Store;
    'fx:payment_preset': PaymentPresetRel;
  };
  props: Rels.FraudProtection['props'] & {
    helper: AvailableFraudProtectionsRel['props']['values'][string];
  };
}

interface AvailablePaymentMethodsRel extends Graph {
  curie: 'fx:available_payment_methods';
  props: {
    values: {
      [key: string]: {
        /** The name of this payment gateway. */
        name: string;
        /** The default id you can use for testing this gateway. */
        test_id: string;
        /** The default key you can use for testing this gateway. */
        test_key: string;
        /** The description of the id field for this gateway. */
        id_description: string;
        /** The description of the key field for this gateway. */
        key_description: string;
        /** Whether or not this gateway supports 3D Secure functionality. */
        supports_3d_secure: 0 | 1;
        /** Whether or not this gateway supports authorize only instead of auth+capture. */
        supports_auth_only: 0 | 1;
        /** The default third party key you can use for testing this gateway. */
        test_third_party_key: string;
        /** The description of the third party key field for this gateway. */
        third_party_key_description: string;
        /** Whether or not this payment method is deprecated. */
        is_deprecated: boolean;
        /** If this gateway requires additional information, this will contain details about the data which needs to be collected to configure this gateway. */
        additional_fields: null | {
          blocks: {
            id: string;
            is_live: boolean;
            parent_id: string;
            fields: {
              id: string;
              type: string;
              name: string;
              options?: { name: string; value: string }[];
              optional?: boolean;
              file_type?: string;
              description?: string;
              default_value: string;
            }[];
          }[];
        };
        /** If this payment method can't be used due to a conflict with another payment method, the details about it will be here. */
        conflict?: { type: string; name: string };
      };
    };
  };
  links: {
    self: PaymentMethodRel;
  };
}

interface AvailableFraudProtectionsRel extends Graph {
  curie: 'fx:available_fraud_protections';
  links: { self: AvailableFraudProtectionsRel };
  props: {
    values: {
      [key: string]: {
        name: string;
        uses_rejection_threshold: boolean;
        json: null | {
          blocks: {
            id: string;
            is_live?: boolean;
            parent_id: string;
            fields: {
              id: string;
              type: string;
              name: string;
              options?: { name: string; value: string }[];
              optional?: boolean;
              file_type?: string;
              description?: string;
              default_value: unknown;
            }[];
          }[];
        };
      };
    };
  };
}

export type PaymentMethods = Resource<PaymentMethodsRel>;
export type PaymentMethod = Resource<PaymentMethodRel>;

export type PaymentPresets = Resource<PaymentPresetsRel>;
export type PaymentPreset = Resource<PaymentPresetRel>;

export type FraudProtections = Resource<FraudProtectionsRel>;
export type FraudProtection = Resource<FraudProtectionRel>;

export type AvailablePaymentMethods = Resource<AvailablePaymentMethodsRel>;
export type AvailableFraudProtections = Resource<AvailableFraudProtectionsRel>;
