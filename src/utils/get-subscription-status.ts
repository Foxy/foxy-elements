import type { Resource } from '@foxy.io/sdk/core';
import type { Rels } from '@foxy.io/sdk/customer';

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

type ExtendedStatus =
  | Status
  | 'will_start_no_startdate'
  | 'will_end_no_enddate'
  | 'will_end_after_payment_no_nextdate'
  | 'will_end_after_payment_no_enddate'
  | 'ended_no_enddate'
  | 'next_payment_no_nextdate'
  | 'failed_and_ended_no_enddate';

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

  if (isActive && end && end > now) return next < end ? 'will_end_after_payment' : 'will_end';
  if (isActive) return end ? 'ended' : 'next_payment';

  return start <= now && end && end <= now ? 'ended' : 'inactive';
}

export function getExtendedSubscriptionStatus(
  data: Data | null,
  settings: Resource<Rels.CustomerPortalSettings>
): ExtendedStatus | null {
  const status = getSubscriptionStatus(data);
  const config = settings.cart_display_config;

  const showStartDate = config?.show_sub_startdate ?? true;
  const showNextDate = config?.show_sub_nextdate ?? true;
  const showEndDate = config?.show_sub_enddate ?? true;

  if (status === 'failed_and_ended' && !showEndDate) return `${status}_no_enddate` as const;
  if (status === 'next_payment' && !showNextDate) return `${status}_no_nextdate` as const;
  if (status === 'will_start' && !showStartDate) return `${status}_no_startdate` as const;
  if (status === 'will_end' && !showEndDate) return `${status}_no_enddate` as const;
  if (status === 'ended' && !showEndDate) return `${status}_no_enddate` as const;
  if (status === 'will_end_after_payment') {
    if (!showEndDate && !showNextDate) return `next_payment_no_nextdate`;
    if (!showNextDate) return `${status}_no_nextdate` as const;
    if (!showEndDate) return `${status}_no_enddate` as const;
  }

  return status;
}
