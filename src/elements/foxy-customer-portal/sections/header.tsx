import { useIntl } from "react-intl";
import { Button } from "@foxy.io/design-system/button";
import { Spinner } from "@foxy.io/design-system/spinner";
import { formatFullName } from "../full-name";
import { messages } from "../messages";

export type CustomerProps = {
  first_name?: string;
  last_name?: string;
  email?: string;
  tax_id?: string;
};

/**
 * Sign-out has three visible states, matching v1: idle, in flight, and a
 * one-second error state after a failed request (spec 7.1). A boolean cannot
 * express the third, so the parent drives this instead.
 */
export type SignOutState = "idle" | "busy" | "error";

type Props = {
  customer: CustomerProps;
  fullNameTemplate: string;
  onEditProfile: () => void;
  onSignOut: () => void;
  signOutState: SignOutState;
};

export function PortalHeader({
  customer,
  fullNameTemplate,
  onEditProfile,
  onSignOut,
  signOutState,
}: Props) {
  const intl = useIntl();
  const fullName = formatFullName(fullNameTemplate, customer);

  return (
    <header>
      <div>
        <h1>{fullName}</h1>
        <p>{customer.email}</p>
        {customer.tax_id ? (
          <p>
            {intl.formatMessage(messages.headerTaxId, {
              taxId: customer.tax_id,
            })}
          </p>
        ) : null}
      </div>

      <div>
        <Button type="button" $variant="outline" onClick={onEditProfile}>
          {intl.formatMessage(messages.headerEditProfile)}
        </Button>

        <Button
          type="button"
          $variant="ghost"
          aria-label={intl.formatMessage(
            signOutState === "error"
              ? messages.headerSignOutFailed
              : messages.headerSignOut,
          )}
          disabled={signOutState === "busy"}
          onClick={onSignOut}
        >
          {signOutState === "busy" ? (
            <Spinner />
          ) : signOutState === "error" ? (
            "!"
          ) : (
            "→"
          )}
        </Button>
      </div>
    </header>
  );
}
