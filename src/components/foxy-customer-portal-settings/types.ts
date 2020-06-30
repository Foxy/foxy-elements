import { RelContext } from '../../mixins/stateful';
import { AnyEventObject } from 'xstate/dist/xstate.web.js';
import { RequestEvent } from '../../events/request';

export interface FoxyCustomerPortalSettingsResource {
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

export interface FoxyCustomerPortalSettingsContext extends RelContext {
  resource?: FoxyCustomerPortalSettingsResource;
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
