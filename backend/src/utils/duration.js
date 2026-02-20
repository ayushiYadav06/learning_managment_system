/**
 * Compute end date from start date and duration.
 * Durations: 4-month, 8-month, 12-month, 2-year, 4-year
 */
export function addDuration(startDate, duration) {
  const d = new Date(startDate);
  switch (duration) {
    case '4-month':
      d.setMonth(d.getMonth() + 4);
      return d;
    case '8-month':
      d.setMonth(d.getMonth() + 8);
      return d;
    case '12-month':
      d.setFullYear(d.getFullYear() + 1);
      return d;
    case '2-year':
      d.setFullYear(d.getFullYear() + 2);
      return d;
    case '4-year':
      d.setFullYear(d.getFullYear() + 4);
      return d;
    default:
      d.setMonth(d.getMonth() + 1);
      return d;
  }
}
