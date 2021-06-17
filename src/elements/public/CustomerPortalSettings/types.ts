import { ErrorType, FriendlyError } from '../../private';
import { FxCustomerPortalSettings, FxStore } from '../../../types/hapi';

export interface CustomerPortalSettingsContext {
  oldResource: FxCustomerPortalSettings | null;
  newResource: FxCustomerPortalSettings | null;
  invalid: ('sessionLifespanInMinutes' | 'jwtSharedSecret')[];
  store: FxStore | null;
  error: ErrorType | null;
  href: string | null;
}

export interface CustomerPortalSettingsLoadSuccessEvent {
  type: 'done.invoke.load';
  data: {
    resource: FxCustomerPortalSettings | null;
    store: FxStore;
  };
}

export interface CustomerPortalSettingsLoadErrorEvent {
  type: 'error.execution';
  data: FriendlyError;
}

export interface CustomerPortalSettingsResetEvent {
  type: 'RESET';
}

export interface CustomerPortalSettingsSetHrefEvent {
  type: 'SET_HREF';
  data: string | null;
}

export interface CustomerPortalSettingsSaveEvent {
  type: 'SAVE';
}

export interface CustomerPortalSettingsSetOriginsEvent {
  type: 'SET_ORIGINS';
  value: string[];
}

export interface CustomerPortalSettingsSetFrequencyModificationEvent {
  type: 'SET_FREQUENCY_MODIFICATION';
  value: FxCustomerPortalSettings['subscriptions']['allowFrequencyModification'];
}

export interface CustomerPortalSettingsSetNextDateModificationEvent {
  type: 'SET_NEXT_DATE_MODIFICATION';
  value: FxCustomerPortalSettings['subscriptions']['allowNextDateModification'];
}

export interface CustomerPortalSettingsSetSecretEvent {
  type: 'SET_SECRET';
  value: string;
  invalid: boolean;
}

export interface CustomerPortalSettingsSetSessionEvent {
  type: 'SET_SESSION';
  value: number;
  invalid: boolean;
}
