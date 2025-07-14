import { formatDistanceToNow, parseISO } from "date-fns";

export function getRelativeTime(isoDate: string): string {
  return formatDistanceToNow(parseISO(isoDate), {
    addSuffix: true,
  });
}
