export interface Rule {
  min?: string;
  max?: string;
  jsonataQuery: string;
  disallowedDates?: string[];
  allowedDays?: {
    type: 'day' | 'month';
    days: number[];
  };
}
