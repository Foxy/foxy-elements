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

type Props = {
  customer: CustomerProps;
  fullNameTemplate: string;
  onEditProfile: () => void;
  onSignOut: () => void;
  isSigningOut: boolean;
};

export function PortalHeader({
  customer,
  fullNameTemplate,
  onEditProfile,
  onSignOut,
  isSigningOut,
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
          aria-label={intl.formatMessage(messages.headerSignOut)}
          disabled={isSigningOut}
          onClick={onSignOut}
        >
          {isSigningOut ? <Spinner /> : "→"}
        </Button>
      </div>
    </header>
  );
}
