import { useId, useMemo, useState } from "react";
import { FormattedDate, useIntl } from "react-intl";
import { Alert } from "@foxy.io/design-system/alert";
import { SummaryTable } from "@foxy.io/design-system/summary-table";
import { Button } from "@foxy.io/design-system/button";
import { Calendar } from "@foxy.io/design-system/calendar";
import { Field } from "@foxy.io/design-system/field";
import { Select } from "@foxy.io/design-system/select";
import {
  getAllowedFrequencies,
  getNextTransactionDateConstraints,
} from "@foxy.io/sdk/customer";
import { useApi, WriteError } from "@/lib/customer-api";
import { toCalendarDate } from "../../calendar-date";
import { messages } from "../../messages";
import { PortalDialog } from "../../portal-dialog";
import { usePortalContainer } from "../../portal-container";
import { patchResource } from "../../write";
import { toDatePickerBounds, toLocalDateString } from "./date-constraints";
import type { SubscriptionResource } from "./card";

/**
 * Raw (snake_case) shape of a single next-date modification rule, as the API
 * returns it. Mirrors `CustomerPortalSettings['props']['subscriptions']
 * ['allow_next_date_modification']` from `@foxy.io/sdk`, which is not
 * exported from any public subpath, so the shape is declared here instead of
 * cast through `unknown` at the call site.
 */
type NextDateModificationRule = {
  min?: string;
  max?: string;
  jsonata_query: string;
  disallowed_dates?: string[];
  allowed_days?:
    { type: "day"; days: number[] } | { type: "month"; days: number[] };
};

/** False disables modification, true lifts all constraints, an array defines custom rules. */
type NextDateModificationRules = boolean | NextDateModificationRule[];

export type PortalSettings = {
  subscriptions: {
    allow_frequency_modification: unknown;
    allow_next_date_modification: NextDateModificationRules;
  };
};

type Props = {
  subscription: SubscriptionResource;
  settings: PortalSettings | null;
  open: boolean;
  onClose: () => void;
  /**
   * Fired once a save actually wrote through `patchResource`, just before
   * `onClose`. `onClose` alone cannot tell the parent a save happened -- it
   * fires identically on save-success, on the backdrop/Escape dismissal via
   * `onOpenChange`, and on the Close button -- so a parent that needs to
   * react only to a real write (`list.tsx` refreshing the cached collection)
   * needs this second, optional callback rather than overloading `onClose`'s
   * signature, which `PortalDialog`'s `onOpenChange={(next) => !next &&
   * onClose()}` already calls with zero arguments.
   */
  onSaved?: () => void;
};

/** Builds a hosted-cart link from the subscription's token URL. */
function tokenLink(href: string, params: Record<string, string>): string {
  const url = new URL(href);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function ManageDialog({
  subscription,
  settings,
  open,
  onClose,
  onSaved,
}: Props) {
  const intl = useIntl();
  const { onUnauthenticated } = useApi();
  const portalContainer = usePortalContainer();
  const frequencyId = useId();

  const [frequency, setFrequency] = useState(subscription.frequency);
  const [nextDate, setNextDate] = useState<Date | undefined>(undefined);
  const [isBusy, setIsBusy] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const hasEnded =
    !!subscription.end_date &&
    subscription.end_date !== "0000-00-00" &&
    new Date(subscription.end_date).getTime() <= Date.now();

  // The SDK normalises snake_case at its own boundary, so `settings` goes in
  // exactly as the API returned it. Converting the keys here would produce
  // undefined JSONata queries and silently wrong gating.
  const frequencies = useMemo(() => {
    if (!settings) return [];
    try {
      return Array.from(
        getAllowedFrequencies({
          settings: settings as never,
          subscription: subscription as never,
        }),
      );
    } catch {
      return [];
    }
  }, [settings, subscription]);

  // Three shapes: `false` means the store switched this off entirely, `true`
  // means any date, an object means translate the rules into picker bounds.
  const dateRules = useMemo(() => {
    if (!settings) return false;
    try {
      return getNextTransactionDateConstraints(
        subscription as never,
        settings.subscriptions.allow_next_date_modification,
      );
    } catch {
      return false;
    }
  }, [settings, subscription]);

  const bounds = useMemo(
    () =>
      typeof dateRules === "object"
        ? toDatePickerBounds(dateRules)
        : { disabled: [] as never[] },
    [dateRules],
  );

  const tokenHref = subscription._links["fx:sub_token_url"]?.href;
  const modifyHref = subscription._links["fx:sub_modification_url"]?.href;

  // The customer-scoped subscription resource exposes no `id` — only
  // `third_party_id`, which is set solely for external systems like PayPal
  // Express and is usually empty. The identifier the customer recognises is
  // the last segment of the self link.
  const subscriptionId = subscription._links.self.href
    .replace(/\/+$/, "")
    .split("/")
    .pop();

  // `toCalendarDate` -- not the raw `end_date` string -- so `<FormattedDate>`
  // renders the store's calendar day instead of re-deriving it from the
  // instant and shifting it for a viewer east of the store's timezone. It
  // already returns null for both `null` and the `'0000-00-00'` sentinel, so
  // it doubles as the "does this subscription have an end date" check below.
  const endsAt = toCalendarDate(subscription.end_date);
  const startedAt = toCalendarDate(subscription.start_date);

  // Doubles as the "does this subscription have an end date" check `endsAt`'s
  // own comment above describes -- `toCalendarDate` already excludes both
  // `null` and the `'0000-00-00'` unset sentinel.
  const hasEndDate = !!endsAt;

  async function handleSave() {
    // Only the fields the customer actually touched go in the body. Sending
    // `frequency` unconditionally regressed past v1, which serialised only
    // its `edits` (`NucleonElement._sendPatch`) -- and it is the one field
    // this dialog can offer with nothing to change: when the store allows no
    // frequency modification, the Select doesn't render at all, yet a save
    // would still have PATCHed the untouched value.
    const changes: Partial<SubscriptionResource> = {};
    if (frequency !== subscription.frequency) changes.frequency = frequency;
    if (nextDate) changes.next_transaction_date = toLocalDateString(nextDate);

    if (Object.keys(changes).length === 0) {
      onClose();
      return;
    }

    setIsBusy(true);
    setHasFailed(false);

    try {
      await patchResource(subscription._links.self as never, changes);
      onSaved?.();
      onClose();
    } catch (caught) {
      // This dialog sends no credentials, so 401/403 can only mean the session
      // died — the password dialog is the one place 401 means "wrong value".
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
    <PortalDialog
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title={intl.formatMessage(messages.manageHeading)}
    >
      {hasFailed ? (
        <Alert.Root $variant="destructive">
          <Alert.Description>
            {intl.formatMessage(messages.errorUnknown)}
          </Alert.Description>
        </Alert.Root>
      ) : null}

      {/* Read-only. The spec is explicit that start and end dates are not
          editable here: v1's SubscriptionForm only allows it when portal
          settings are absent, which never happens inside the portal. Cancel
          still sets an end date, via the link-out below. */}
      <SummaryTable.Root>
        {/* `value` renders as a plain text node right next to `title`'s, with
            nothing between them — concatenated in the DOM as e.g.
            "Subscription ID1". `subtitle` is what the design system wraps in
            literal parentheses, so it is what actually sets the id apart. */}
        <SummaryTable.Entry
          title={intl.formatMessage(messages.manageId)}
          subtitle={subscriptionId}
        />
        <SummaryTable.Entry
          title={intl.formatMessage(messages.manageStarted)}
          value={
            startedAt ? (
              <FormattedDate value={startedAt} dateStyle="medium" />
            ) : null
          }
        />
        {endsAt ? (
          <SummaryTable.Entry
            title={intl.formatMessage(messages.manageEnds)}
            value={<FormattedDate value={endsAt} dateStyle="medium" />}
          />
        ) : null}
      </SummaryTable.Root>

      {frequencies.length > 0 ? (
        <Field.Root>
          <Field.Label htmlFor={frequencyId}>
            {intl.formatMessage(messages.manageFrequency)}
          </Field.Label>

          <Select.Root
            value={frequency}
            onValueChange={(next: string | null) => next && setFrequency(next)}
          >
            <Select.Trigger id={frequencyId}>
              <Select.Value />
            </Select.Trigger>

            {/* Select.Portal defaults to <body>, which is outside this
                element's shadow root — the popup would render unstyled.
                `?? undefined` because Base UI reads an explicit null as
                "container unresolved" and never renders. */}
            <Select.Portal container={portalContainer ?? undefined}>
              <Select.Positioner>
                <Select.Popup>
                  <Select.List>
                    {frequencies.map((value) => (
                      <Select.Item key={value} value={value}>
                        <Select.ItemText>{value}</Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select.List>
                </Select.Popup>
              </Select.Positioner>
            </Select.Portal>
          </Select.Root>
        </Field.Root>
      ) : null}

      {dateRules !== false ? (
        <Field.Root>
          <Field.Label>
            {intl.formatMessage(messages.manageNextPayment)}
          </Field.Label>
          <Calendar
            mode="single"
            selected={nextDate}
            onSelect={setNextDate}
            startMonth={"startMonth" in bounds ? bounds.startMonth : undefined}
            endMonth={"endMonth" in bounds ? bounds.endMonth : undefined}
            disabled={bounds.disabled}
          />
        </Field.Root>
      ) : null}

      {/* Link-outs, not forms. v1 sends the customer to a hosted Foxy page for
          all three, and this section keeps that. */}
      {tokenHref ? (
        <a
          // Cancel gates on *having* an end date (`hasEndDate`), not on that
          // date having passed (`hasEnded`, used below for modify/billing).
          // A subscription already scheduled to end still has `hasEnded ===
          // false` right up until that date arrives, and sending it into the
          // hosted cancel flow again is the bug this guards against.
          href={
            hasEndDate
              ? undefined
              : tokenLink(tokenHref, { sub_cancel: "true" })
          }
          aria-disabled={hasEndDate ? "true" : undefined}
        >
          {intl.formatMessage(messages.manageCancel)}
        </a>
      ) : null}

      {modifyHref ? (
        <a
          href={hasEnded ? undefined : modifyHref}
          aria-disabled={hasEnded ? "true" : undefined}
        >
          {intl.formatMessage(messages.manageModify)}
        </a>
      ) : null}

      {tokenHref ? (
        <a
          href={
            hasEnded
              ? undefined
              : tokenLink(tokenHref, { cart: "checkout", sub_restart: "auto" })
          }
          aria-disabled={hasEnded ? "true" : undefined}
        >
          {intl.formatMessage(messages.manageUpdateBilling)}
        </a>
      ) : null}

      <Button type="button" onClick={handleSave} disabled={isBusy}>
        {intl.formatMessage(
          isBusy ? messages.manageSaving : messages.manageSave,
        )}
      </Button>

      <Button type="button" $variant="outline" onClick={onClose}>
        {intl.formatMessage(messages.manageClose)}
      </Button>
    </PortalDialog>
  );
}
