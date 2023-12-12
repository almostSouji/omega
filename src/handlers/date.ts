export const DISCORD_EPOCH = 1420070400000n as const;
export const TWITTER_EPOCH = 1288834974657n as const;

function parseDate(date: string) {
  return /\d{4}\/\d{2}\/\d{2}/.exec(date)
    ? new Date(`${date} GMT`)
    : new Date(date);
}

function compareDate(a: Date, b: Date) {
  return a.getTime() - b.getTime();
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

export function matchDate(key: string, value: string, userValue: string) {
  const valueDate = parseDate(value);
  const userValueDate = parseDate(userValue);
  return matchDates(key, valueDate, userValueDate);
}

export function matchSnowflake(key: string, value: string, userValue: string) {
  const [, snowflakeKey] = key.split("|");
  const epochString = snowflakeKey?.split(/[\(\)]/)[1];
  const epoch = convertEpoch(epochString);

  try {
    const valueDate = parseDate(value);
    const userValueDate = new Date(Number((BigInt(userValue) >> 22n) + epoch));
    return matchDates(key, valueDate, userValueDate);
  } catch {
    return false;
  }
}

function matchDates(key: string, date1: Date, date2: Date) {
  const [, , op] = key.split("|");
  switch (op) {
    case "before":
      return compareDate(date2, date1) < 0;
    case "after":
      return compareDate(date2, date1) > 0;
    case "sameday":
      return isSameDay(date2, date1);
    default:
      return compareDate(date2, date1) === 0;
  }
}

function convertEpoch(epoch?: string) {
  if (!epoch) {
    return 0n;
  }

  switch (epoch) {
    case "discord":
      return DISCORD_EPOCH;
    case "twitter":
    case "x":
      return TWITTER_EPOCH;
    default:
      return BigInt(epoch);
  }
}
