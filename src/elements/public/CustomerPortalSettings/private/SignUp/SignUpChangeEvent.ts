import type { FxCustomerPortalSettings } from '../../../../../types/hapi';

export class SignUpChangeEvent extends CustomEvent<FxCustomerPortalSettings['signUp']> {
  constructor(value: FxCustomerPortalSettings['signUp']) {
    super('change', { detail: value });
  }
}
