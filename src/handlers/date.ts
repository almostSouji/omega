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
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function matchDate(key: string, value: string, userValue: string) {
  const valueDate = parseDate(value);
  const userValueDate = parseDate(userValue);

  const [, , op] = key.split("|");
  switch (op) {
    case "before":
      return compareDate(userValueDate, valueDate) < 0;
    case "after":
      return compareDate(userValueDate, valueDate) > 0;
    case "sameday":
      return isSameDay(userValueDate, valueDate);
    default:
      return compareDate(userValueDate, valueDate) === 0;
  }
}
