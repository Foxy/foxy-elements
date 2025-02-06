import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/backend';

type Data = Pick<
  Resource<Rels.Subscription>,
  | 'is_active'
  | 'first_failed_transaction_date'
  | 'start_date'
  | 'next_transaction_date'
  | 'end_date'
>;

type Status =
  | 'will_start'
  | 'will_end'
  | 'will_end_after_payment'
  | 'next_payment'
  | 'ended'
  | 'failed'
  | 'failed_and_ended'
  | 'inactive';

export function getSubscriptionStatus(data: Data | null): Status | null {
  if (data === null) return null;

  const getTime = (date: string | null) => {
    if (!date || date === '0000-00-00') return null;
    return new Date(date).getTime();
  };

  const isActive = data.is_active;
  const failure = getTime(data.first_failed_transaction_date);
  const start = getTime(data.start_date);
  const next = getTime(data.next_transaction_date);
  const end = getTime(data.end_date);
  const now = Date.now();

  if (failure) return end && end <= now ? 'failed_and_ended' : 'failed';
  if (start === null) return null;

  if (isActive && start > now) return 'will_start';
  if (next === null) return null;

  if (isActive && end && end > now) return next <= end ? 'will_end_after_payment' : 'will_end';
  if (isActive) return end ? 'ended' : 'next_payment';

  return start <= now && end && end <= now ? 'ended' : 'inactive';
}
