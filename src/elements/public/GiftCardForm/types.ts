import { Data as GiftCardCode } from '../GiftCardCodeForm/types';

export { Data } from '../GiftCardCard/types';

export type GiftCardCodes = {
  _embedded: { 'fx:gift_card_codes': GiftCardCode[] };
  _links: {
    first: { href: string };
    prev: { href: string };
    next: { href: string };
    last: { href: string };
    self: { href: string };
  };
  returned_items: number;
  total_items: number;
  offset: number;
  limit: number;
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
