export interface QuickOrderProduct {
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

export interface QuickOrderResource {
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

export type QuickOrderContext = undefined | QuickOrderResource;

export interface QuickOrderSchema {
  states: {
    enabled: any;
    disabled: any;
  };
}

export interface QuickOrderDisableEvent {
  type: 'DISABLE';
}

export interface QuickOrderEnableEvent {
  type: 'ENABLE';
}

export interface QuickOrderSetFrequencyModificationEvent {
  type: 'SET_FREQUENCY_MODIFICATION';
  value: QuickOrderResource['subscriptions']['allowFrequencyModification'];
}

export interface QuickOrderSetNextDateModificationEvent {
  type: 'SET_NEXT_DATE_MODIFICATION';
  value: QuickOrderResource['subscriptions']['allowNextDateModification'];
}

export type QuickOrderEvent =
  | QuickOrderDisableEvent
  | QuickOrderEnableEvent
  | QuickOrderSetFrequencyModificationEvent
  | QuickOrderSetNextDateModificationEvent;
