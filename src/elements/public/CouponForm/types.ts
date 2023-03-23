import { Rels } from '@foxy.io/sdk/backend';
import { Resource } from '@foxy.io/sdk/core';

// TODO: simplify the type below once the SDK is updated

export type Data = Resource<Rels.Coupon> & {
  customer_auto_apply: boolean;
  customer_attribute_restrictions: string;
  customer_subscription_restrictions: string;
};

export type RulesTierParams = {
  source: string;
  method: string;
  units: string;
  tier?: string;
  onChange: (newParams: Partial<RulesTierParams>) => void;
  onDelete: () => void;
};

export type RulesTierFieldParams = {
  value: string;
  label: string;
  onChange: (newValue: string) => void;
};

export type RulesTierSwitchParams = {
  value: number;
  options: [string, string];
  onChange: (newValueIndex: number) => void;
};

export type RulesTierSelectParams = {
  label: string;
  value: string;
  options: Record<string, string>;
  onChange: (newValue: string) => void;
};
