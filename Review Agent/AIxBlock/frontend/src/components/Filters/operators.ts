const Operators: { [k: string]: { [k: string]: string } } = {
  boolean: {
    equal: "is",
    empty: "is empty",
  },
  date: {
    less: "is before",
    greater: "is after",
    in: "is between",
    not_in: "not between",
    empty: "is empty",
  },
  datetime: {
    less: "is before",
    greater: "is after",
    in: "is between",
    not_in: "not between",
    empty: "is empty",
  },
  list: {
    contains: "contains",
    not_contains: "not contains",
    empty: "is empty",
  },
  number: {
    equal: "=",
    not_equal: "≠",
    less: "<",
    greater: ">",
    less_or_equal: "≤",
    greater_or_equal: "≥",
    in: "is between",
    not_in: "not between",
    empty: "is empty",
  },
  string: {
    contains: "contains",
    not_contains: "not contains",
    regex: "regex",
    equal: "equal",
    not_equal: "not equal",
    empty: "is empty",
  },
  fallback: {
    empty: "is empty",
  },
}

export default function getOperators(type: string): { [k: string]: string } {
  type = type.toLowerCase();

  if (Object.hasOwn(Operators, type)) {
    return Operators[type];
  }

  return Operators["fallback"];
}

export function getDefaultOperator(type: string) {
  const keys = Object.keys(getOperators(type));
  return keys[0];
}
