/**
 * Small formatting helpers for task dates. No date library dependency —
 * the app only needs "friendly display" + "how urgent is this deadline",
 * both of which plain Date/Intl cover without adding a package.
 */

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
});

/** e.g. "Jun 2, 6:00 PM" — used for both scheduledAt and deadline display. */
export function formatDateTime(iso: string | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return dateTimeFormatter.format(date);
}

export type DeadlineUrgency = 'overdue' | 'soon' | 'normal';

/**
 * Buckets a deadline for badge coloring: overdue (red), due within 24h
 * ("soon", amber), or normal (no special styling). Completed tasks
 * shouldn't be run through this — a finished task isn't "overdue".
 */
export function getDeadlineUrgency(iso: string | undefined): DeadlineUrgency | null {
  if (!iso) return null;
  const deadline = new Date(iso).getTime();
  if (Number.isNaN(deadline)) return null;
  const now = Date.now();
  if (deadline < now) return 'overdue';
  if (deadline - now < 24 * 60 * 60 * 1000) return 'soon';
  return 'normal';
}

/**
 * Parses a "YYYY-MM-DD HH:mm" local-time string (what the task form asks
 * for) into an ISO 8601 string the backend's @IsDateString expects.
 * Returns null if the input doesn't match — callers treat that as
 * "leave the field empty" rather than a hard error, since the field is
 * optional.
 */
export function localDateTimeToIso(value: string): string | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
}

/** Inverse of localDateTimeToIso, for pre-filling the edit form. */
export function isoToLocalDateTime(iso: string | undefined): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
