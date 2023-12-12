export function matchNumber(key: string, value: number, evaluatedValue: number) {
  const [, op] = key.split("|");

  switch (op) {
    case "gt":
    case ">":
      return evaluatedValue > value;
    case "gte":
    case ">=":
      return evaluatedValue >= value;
    case "lt":
    case "<":
      return evaluatedValue < value;
    case "lte":
    case "<=":
      return evaluatedValue <= value;
    default:
      return evaluatedValue === value;
  }
}
