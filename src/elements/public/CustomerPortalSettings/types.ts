export interface CustomerPortalSettingsResource {
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

export type CustomerPortalSettingsContext = undefined | CustomerPortalSettingsResource;

export interface CustomerPortalSettingsSchema {
  states: {
    enabled: Record<string, unknown>;
    disabled: Record<string, unknown>;
  };
}

export interface CustomerPortalSettingsDisableEvent {
  type: 'DISABLE';
}

export interface CustomerPortalSettingsEnableEvent {
  type: 'ENABLE';
}

export interface CustomerPortalSettingsSetOriginsEvent {
  type: 'SET_ORIGINS';
  value: string[];
}

export interface CustomerPortalSettingsSetFrequencyModificationEvent {
  type: 'SET_FREQUENCY_MODIFICATION';
  value: CustomerPortalSettingsResource['subscriptions']['allowFrequencyModification'];
}

export interface CustomerPortalSettingsSetNextDateModificationEvent {
  type: 'SET_NEXT_DATE_MODIFICATION';
  value: CustomerPortalSettingsResource['subscriptions']['allowNextDateModification'];
}

export interface CustomerPortalSettingsSetSecretEvent {
  type: 'SET_SECRET';
  value: string;
}

export interface CustomerPortalSettingsSetSessionEvent {
  type: 'SET_SESSION';
  value: number;
}

export type CustomerPortalSettingsEvent =
  | CustomerPortalSettingsDisableEvent
  | CustomerPortalSettingsEnableEvent
  | CustomerPortalSettingsSetOriginsEvent
  | CustomerPortalSettingsSetFrequencyModificationEvent
  | CustomerPortalSettingsSetNextDateModificationEvent
  | CustomerPortalSettingsSetSecretEvent
  | CustomerPortalSettingsSetSessionEvent;
