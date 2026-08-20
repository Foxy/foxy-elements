import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { Button } from "@foxy.io/design-system/button";
import { Skeleton } from "@foxy.io/design-system/skeleton";
import {
  UnauthenticatedError,
  useApi,
  useResource,
  type FollowableLink,
  type ReadResponse,
} from "@/lib/customer-api";
import { PortalHeader, type SignOutState } from "../sections/header";
import { PasswordDialog } from "../sections/password-dialog";
import {
  ProfileDialog,
  type CustomerResource,
} from "../sections/profile-dialog";
import { messages } from "../messages";

/** How long the sign-out button stays in its error state. Matches v1. */
const SIGN_OUT_ERROR_MS = 1000;

type Props = {
  fullNameTemplate: string;
  onSignedOut: () => void;
  /** Called when the API says this customer is not signed in any more. */
  onUnauthenticated: () => void;
};

export function AccountScreen({
  fullNameTemplate,
  onSignedOut,
  onUnauthenticated,
}: Props) {
  const intl = useIntl();
  const { api } = useApi();

  // The customer API's root graph *is* the customer, so `api.get()` returns it.
  // Wrapped as a link rather than cast: `API` has no `href`, and the cache keys
  // on `href`. Status checking lives in the hook — see `assertReadSucceeded`.
  const rootLink = useMemo<FollowableLink<CustomerResource>>(
    () => ({
      href: api.base.toString(),
      get: () =>
        api.get() as unknown as Promise<ReadResponse<CustomerResource>>,
    }),
    [api],
  );

  const { data, error, isLoading, refresh } =
    useResource<CustomerResource>(rootLink);

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [signOutState, setSignOutState] = useState<SignOutState>("idle");
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimer.current !== null) clearTimeout(errorTimer.current);
    };
  }, []);

  const handleSignOut = useCallback(async () => {
    setSignOutState("busy");

    try {
      await api.signOut();
      onSignedOut();
    } catch {
      // `API.signOut` throws before clearing local session state, so the
      // customer is still signed in here. Show the failure for a second and go
      // back to idle so they can try again — same behaviour as v1.
      setSignOutState("error");
      errorTimer.current = setTimeout(
        () => setSignOutState("idle"),
        SIGN_OUT_ERROR_MS,
      );
    }
  }, [api, onSignedOut]);

  // Routing has to happen in an effect: `error` is read during render, and
  // switching screens from there would update the parent mid-render.
  const isUnauthenticated = error instanceof UnauthenticatedError;

  useEffect(() => {
    if (isUnauthenticated) onUnauthenticated();
  }, [isUnauthenticated, onUnauthenticated]);

  // Hold the loading shape rather than flashing "we couldn't load your
  // account" on the way back to sign in.
  if (isLoading || isUnauthenticated) return <Skeleton />;

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
        signOutState={signOutState}
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
