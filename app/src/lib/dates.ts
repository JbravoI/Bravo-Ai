export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  }).format(new Date(iso));
}

export function toIsoDate(value: string) {
  const match = value.match(/^(\d{1,2}) ([A-Za-z]{3}) (\d{4})$/);
  if (!match) return undefined;
  const month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].indexOf(match[2]);
  if (month < 0) return undefined;
  const date = new Date(Date.UTC(Number(match[3]), month, Number(match[1])));
  if (date.getUTCMonth() !== month || date.getUTCDate() !== Number(match[1])) return undefined;
  return date.toISOString().slice(0, 10);
}
