import { useId, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Dialog } from "@foxy.io/design-system/dialog";
import { Field } from "@foxy.io/design-system/field";
import { Input } from "@foxy.io/design-system/input";
import { WriteError, useApi, type FollowableLink } from "@/lib/customer-api";
import { messages } from "../messages";
import { usePortalContainer } from "../portal-container";
import { patchResource } from "../write";
import type { CustomerProps } from "./header";

export type CustomerResource = CustomerProps & {
  _links: { self: FollowableLink<unknown> };
};

type Props = { customer: CustomerResource; open: boolean; onClose: () => void };

export function ProfileDialog({ customer, open, onClose }: Props) {
  const intl = useIntl();
  const { onUnauthenticated } = useApi();
  const portalContainer = usePortalContainer();
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const taxIdId = useId();

  const [firstName, setFirstName] = useState(customer.first_name ?? "");
  const [lastName, setLastName] = useState(customer.last_name ?? "");
  const [email, setEmail] = useState(customer.email ?? "");
  const [taxId, setTaxId] = useState(customer.tax_id ?? "");
  const [isBusy, setIsBusy] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsBusy(true);
    setHasFailed(false);

    try {
      // Password is deliberately absent — it has its own dialog.
      // patchResource, not patch?.(), so an unwritable link fails instead of
      // closing the dialog as though the save succeeded.
      await patchResource(customer._links.self, {
        first_name: firstName,
        last_name: lastName,
        email,
        tax_id: taxId,
      });

      onClose();
    } catch (caught) {
      // This dialog sends no credentials, so a 401/403 can only mean the
      // session died. The password dialog is the one place where 401 means
      // "the value you typed was wrong" — it must not route.
      if (caught instanceof WriteError && caught.isUnauthorized) {
        onUnauthenticated();
        return;
      }

      setHasFailed(true);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next: boolean) => !next && onClose()}
    >
      {/* Portal/Backdrop/Viewport are required Base UI parts — Popup does not
          render without them. `container` keeps the dialog inside the shadow
          root. Base UI's `FloatingPortal` treats an explicit `null` as "the
          container ref hasn't resolved yet" and renders nothing forever, so
          the context's `null` default (no shadow root, e.g. in tests) is
          coerced to `undefined` here, which is what actually falls back to
          `<body>`. */}
      <Dialog.Portal container={portalContainer ?? undefined}>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup>
            <Dialog.Title>
              {intl.formatMessage(messages.profileHeading)}
            </Dialog.Title>

            <form onSubmit={handleSubmit}>
              {hasFailed && (
                <Alert.Root $variant="destructive">
                  <Alert.Description>
                    {intl.formatMessage(messages.errorUnknown)}
                  </Alert.Description>
                </Alert.Root>
              )}

              <Field.Root>
                <Field.Label htmlFor={firstNameId}>
                  {intl.formatMessage(messages.profileFirstName)}
                </Field.Label>
                <Input
                  id={firstNameId}
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label htmlFor={lastNameId}>
                  {intl.formatMessage(messages.profileLastName)}
                </Field.Label>
                <Input
                  id={lastNameId}
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label htmlFor={emailId}>
                  {intl.formatMessage(messages.signInEmail)}
                </Field.Label>
                <Input
                  id={emailId}
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label htmlFor={taxIdId}>
                  {intl.formatMessage(messages.profileTaxId)}
                </Field.Label>
                <Input
                  id={taxIdId}
                  type="text"
                  value={taxId}
                  onChange={(event) => setTaxId(event.target.value)}
                />
              </Field.Root>

              <Button type="submit" disabled={isBusy}>
                {intl.formatMessage(
                  isBusy ? messages.profileSaving : messages.profileSave,
                )}
              </Button>

              <Button type="button" $variant="outline" onClick={onClose}>
                {intl.formatMessage(messages.profileCancel)}
              </Button>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
