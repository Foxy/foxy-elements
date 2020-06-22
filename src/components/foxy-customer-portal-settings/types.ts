import { RequestEvent } from '../../stateful-element.js';
import { AnyEventObject } from 'xstate';

export interface FoxyCustomerPortalSettingsContext {
  fetch: Window['fetch'];
  resource?: {
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
  };
}

export interface FoxyCustomerPortalSettingsSchema {
  states: {
    idle: {
      states: {
        unchanged: {};
        modified: {};
      };
    };
    busy: {};
    error: {};
  };
}

export interface FoxyCustomerPortalSettingsOriginsRequest {
  type: 'origins.request';
  data: RequestEvent;
}

export type FoxyCustomerPortalSettingsEvent = AnyEventObject;
