const toRange = (...dates: [Date, Date]) => dates.map(v => v.toISOString()).join('..');

export interface Preset {
  jsonata: string;
  source: string;
  label: string;
}

export const createPresets = (): Preset[] => {
  const todayStart = new Date(new Date(new Date()).setHours(0, 0, 0, 0));
  const last30DaysStart = new Date(new Date(todayStart).setDate(todayStart.getDate() - 30));
  const tomorrowStart = new Date(new Date(todayStart).setDate(todayStart.getDate() + 1));
  const tomorrowEnd = new Date(new Date(todayStart).setDate(todayStart.getDate() + 2) - 1);
  const weekEnd = new Date(new Date(todayStart).setDate(todayStart.getDate() + 7) - 1);

  return [
    {
      jsonata: 'total_items',
      source: 'subscriptions?is_active=1&limit=0',
      label: 'dashboard.widgets.subscriptions_active',
    },
    {
      jsonata: 'total_items',
      source: `subscriptions?next_payment_date=${toRange(tomorrowStart, tomorrowEnd)}&limit=0`,
      label: 'dashboard.widgets.subscriptions_tomorrow',
    },
    {
      jsonata: 'total_items',
      source: `subscriptions?next_payment_date=${toRange(tomorrowStart, weekEnd)}&limit=0`,
      label: 'dashboard.widgets.subscriptions_next7days',
    },
    {
      jsonata: 'total_items',
      source: `transactions?transaction_date=${toRange(last30DaysStart, new Date())}&limit=0`,
      label: 'dashboard.widgets.transactions_last30days',
    },
  ];
};
