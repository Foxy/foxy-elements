import { Alert } from "@foxy.io/design-system/alert";
import { useIntl } from "react-intl";
import { messages } from "./messages";

export function MissingStoreDomain() {
  const intl = useIntl();

  return (
    <Alert.Root $variant="destructive">
      <Alert.Description>
        {intl.formatMessage(messages.missingStoreDomain)}
      </Alert.Description>
    </Alert.Root>
  );
}

/**
 * Portal root. Screens are added by later tasks; for now it renders the
 * account placeholder so the shell is testable on its own.
 */
export function Portal() {
  const intl = useIntl();
  return <div>{intl.formatMessage(messages.loading)}</div>;
}
