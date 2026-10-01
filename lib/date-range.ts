export type DateRange = { from: Date; to: Date };

// Admin date filters send their range as ISO instants (`from` inclusive,
// `to` exclusive) computed from the browser's local calendar, so "today" or
// "this week" follow the admin's day rather than the server's timezone.
export function parseDateRangeParams(request: Request): DateRange | null {
  const params = new URL(request.url).searchParams;
  const from = new Date(params.get("from") ?? "");
  const to = new Date(params.get("to") ?? "");

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    return null;
  }

  return { from, to };
}
