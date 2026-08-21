import type { MessageDescriptor } from "react-intl";
import { messages } from "./messages";

/**
 * Mirrors the SDK's transaction status union (see
 * `@foxy.io/sdk` customer `Graph/transaction.d.ts`). An empty string means a
 * normal, non-hosted payment gateway was used; the SDK's own doc comment
 * says that case "should be considered completed", so it shares a message
 * with `completed` rather than rendering blank.
 *
 * This lives at the element root, not inside `sections/subscriptions/`,
 * because the payments dialog isn't the only place that will show a
 * transaction status: the orders section (FX-276) lists the same
 * transactions and needs the same map without reaching sideways into a
 * sibling section's folder.
 */
export type TransactionStatus =
  | ""
  | "capturing"
  | "captured"
  | "approved"
  | "authorized"
  | "pending"
  | "completed"
  | "problem"
  | "pending_fraud_review"
  | "rejected"
  | "declined"
  | "refunding"
  | "refunded"
  | "voided"
  | "verified";

// `messages.paymentStatusX` etc. are referenced here, not by name lookup, so
// this map itself is the "user" the messages catalog test requires for each.
export const TRANSACTION_STATUS_MESSAGES: Record<
  TransactionStatus,
  MessageDescriptor
> = {
  "": messages.paymentStatusCompleted,
  capturing: messages.paymentStatusProcessing,
  captured: messages.paymentStatusPaid,
  approved: messages.paymentStatusApproved,
  authorized: messages.paymentStatusAuthorized,
  pending: messages.paymentStatusPending,
  completed: messages.paymentStatusCompleted,
  problem: messages.paymentStatusProblem,
  pending_fraud_review: messages.paymentStatusUnderReview,
  rejected: messages.paymentStatusRejected,
  declined: messages.paymentStatusDeclined,
  refunding: messages.paymentStatusRefunding,
  refunded: messages.paymentStatusRefunded,
  voided: messages.paymentStatusVoided,
  verified: messages.paymentStatusVerified,
};

/**
 * `status` on the wire is whatever the API sends, not whatever the SDK's
 * `.d.ts` currently lists -- the union above is a claim about the API, not a
 * runtime guarantee. A status the map doesn't recognize (a new server-side
 * value, a stale SDK type) must not crash the dialog, so this looks the
 * value up defensively and returns `null` instead of indexing the `Record`
 * with an unchecked cast.
 */
export function getTransactionStatusMessage(
  status: string,
): MessageDescriptor | null {
  const messagesByStatus = TRANSACTION_STATUS_MESSAGES as Record<
    string,
    MessageDescriptor | undefined
  >;

  return messagesByStatus[status] ?? null;
}
