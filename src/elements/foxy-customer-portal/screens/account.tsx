import { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import { useApi, useResource, type FollowableLink } from "@/lib/customer-api";
import { PortalHeader } from "../sections/header";
import { PasswordDialog } from "../sections/password-dialog";
import {
  ProfileDialog,
  type CustomerResource,
} from "../sections/profile-dialog";
import { messages } from "../messages";

type Props = { fullNameTemplate: string; onSignedOut: () => void };

export function AccountScreen({ fullNameTemplate, onSignedOut }: Props) {
  const intl = useIntl();
  const { api } = useApi();

  // The customer API's root graph *is* the customer, so `api.get()` returns it.
  // Wrap it as a link rather than casting the API: `API` has no `href`, and the
  // cache keys on `href` — casting would key every read on `undefined`.
  // The SDK types nullable customer fields as `string | null`; our screens use
  // `undefined` for "absent" throughout (see `CustomerProps`), so the cast at
  // this boundary is deliberate, not a type-safety shortcut.
  const rootLink = useMemo<FollowableLink<CustomerResource>>(
    () => ({
      href: api.base.toString(),
      get: async () => {
        const response = await api.get();
        return {
          json: async () =>
            (await response.json()) as unknown as CustomerResource,
        };
      },
    }),
    [api],
  );

  const { data, error, isLoading, refresh } =
    useResource<CustomerResource>(rootLink);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await api.signOut();
      onSignedOut();
    } finally {
      setIsSigningOut(false);
    }
  }

  if (isLoading) return <Skeleton />;

  if (error || !data) {
    return (
      <Alert.Root $variant="destructive">
        <Alert.Description>
          {intl.formatMessage(messages.accountLoadFailed)}
        </Alert.Description>
        <Button type="button" onClick={refresh}>
          {intl.formatMessage(messages.retry)}
        </Button>
      </Alert.Root>
    );
  }

  return (
    <div>
      <PortalHeader
        customer={data}
        fullNameTemplate={fullNameTemplate}
        onEditProfile={() => setIsProfileOpen(true)}
        onSignOut={handleSignOut}
        isSigningOut={isSigningOut}
      />

      <Button
        type="button"
        $variant="link"
        onClick={() => setIsPasswordOpen(true)}
      >
        {intl.formatMessage(messages.profileChangePassword)}
      </Button>

      <ProfileDialog
        customer={data}
        open={isProfileOpen}
        onClose={() => {
          setIsProfileOpen(false);
          refresh();
        }}
      />

      <PasswordDialog
        customer={data}
        open={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
      />

      {/* FX-275 subscriptions, FX-276 orders, FX-277 payment methods and
          addresses mount here, in this order. */}
    </div>
  );
}
