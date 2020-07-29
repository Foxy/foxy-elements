export interface QuickCheckoutProduct {
  name: string;
  price: number;
  image?: string;
  url?: string;
  code?: string;
  parent_code?: string;
  quantity?: number;
  quantity_max?: number;
  quantity_min?: number;
  category?: string;
  expires?: string;
  weight?: string;
  length?: number;
  width?: number;
  height?: number;
  shipto?: string;
  id?: string;
  alt?: string;
  [propName: string]: string | number | undefined;
}

export interface QuickCheckoutResource {
  _links: {
    self: { href: string };
  };

  sso: boolean;
  date_created: string;
  date_modified: string;
  jwtSharedSecret: string;
  sessionLifespanInMinutes: number;
  allowedOrigins: string[];
  subscriptions: {
    allowFrequencyModification:
      | boolean
      | {
          jsonataQuery: string;
          values: string[];
        };

    allowNextDateModification:
      | boolean
      | {
          min?: string;
          max?: string;
          jsonataQuery: string;
          disallowedDates?: string[];
          allowedDays?: {
            type: 'day' | 'month';
            days: number[];
          };
        }[];
  };
}

export type QuickCheckoutContext = undefined | QuickCheckoutResource;

export interface QuickCheckoutSchema {
  states: {
    enabled: {};
    disabled: {};
  };
}

export interface QuickCheckoutDisableEvent {
  type: 'DISABLE';
}

export interface QuickCheckoutEnableEvent {
  type: 'ENABLE';
}

export interface QuickCheckoutSetFrequencyModificationEvent {
  type: 'SET_FREQUENCY_MODIFICATION';
  value: QuickCheckoutResource['subscriptions']['allowFrequencyModification'];
}

export interface QuickCheckoutSetNextDateModificationEvent {
  type: 'SET_NEXT_DATE_MODIFICATION';
  value: QuickCheckoutResource['subscriptions']['allowNextDateModification'];
}

export type QuickCheckoutEvent =
  | QuickCheckoutDisableEvent
  | QuickCheckoutEnableEvent
  | QuickCheckoutSetFrequencyModificationEvent
  | QuickCheckoutSetNextDateModificationEvent;
