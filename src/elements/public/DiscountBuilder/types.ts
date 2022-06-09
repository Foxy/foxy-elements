import type { Rels } from '@foxy.io/sdk/backend';
import type { Resource } from '@foxy.io/sdk/core';

export type DiscountType = Resource<Rels.Coupon>['coupon_discount_type'];

export type ParsedValue = { name: string; type: DiscountType; details: string };

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
