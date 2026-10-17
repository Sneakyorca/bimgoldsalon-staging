const day = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const stamp = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Europe/London",
});
export const formatDay = (isoDate: string) => day.format(new Date(isoDate));
export const formatStamp = (isoTimestamp: string) =>
  stamp.format(new Date(isoTimestamp));
