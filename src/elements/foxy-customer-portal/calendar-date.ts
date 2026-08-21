/**
 * The Foxy API returns dates in the *store's* timezone, not the viewer's --
 * an offset-carrying ISO 8601 string like `'2023-02-11T22:45:01-0700'` (the
 * common shape, matching the SDK's "PHP `c` format" doc), a date-only string
 * like `'2015-04-15'`, or the `'0000-00-00'` sentinel for "unset".
 *
 * Handing any of those straight to `Intl.DateTimeFormat` (what `FormattedDate`
 * and `intl.formatDate` do under the hood) parses the string to an instant
 * and then renders it in the *viewer's* timezone, which can shift the
 * calendar day: `'2023-02-11T22:45:01-0700'` is `05:45:01Z` on Feb 12, so a
 * European viewer sees Feb 12 for a payment the store considers Feb 11.
 *
 * This lives at the element root, not inside `sections/subscriptions/`,
 * for the same reason `transaction-status.ts` does: the orders section
 * (FX-276) will render `transaction_date` too and must not reach sideways
 * into a sibling section's folder.
 *
 * Ported from v1's convention (`InternalDateControl.ts`, `SubscriptionForm.ts`)
 * of slicing the first 10 characters of the raw string rather than parsing it
 * as an instant. Unlike a plain slice-and-reparse, the result here is built
 * from local year/month/day components (`new Date(year, month - 1, day)`),
 * not `new Date('YYYY-MM-DD')` -- the latter is UTC midnight per the ECMA-262
 * date-only grammar, which reintroduces the same bug in the opposite
 * direction for any viewer west of UTC. Building from local components
 * means the digits `Intl.DateTimeFormat` renders back out, in *any* viewer
 * timezone, are the digits the store sent -- no shift either way.
 */
export function toCalendarDate(raw: string | null | undefined): Date | null {
  if (!raw || raw === "0000-00-00") return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(raw);
  if (!match) return null;

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  const date = new Date(year, month - 1, day);

  // Guards against a malformed calendar day (e.g. month 13, day 32) silently
  // rolling over into a neighbouring month instead of degrading to null --
  // unvalidated network data must not produce a plausible-looking wrong date.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}
