export function matchNumber(key: string, value: number, userValue: number) {
  const [, op] = key.split("|");

  switch (op) {
    case "gt":
    case ">":
      return userValue > value;
    case "gte":
    case ">=":
      return userValue >= value;
    case "lt":
    case "<":
      return userValue < value;
    case "lte":
    case "<=":
      return userValue <= value;
    default:
      return userValue === value;
  }
}
