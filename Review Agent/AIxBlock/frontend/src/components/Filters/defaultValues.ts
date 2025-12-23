import dayjs from "dayjs";

const minDate = dayjs().startOf("date").toISOString();
const maxDate = dayjs().endOf("date").toISOString();

const Values: { [k: string]: boolean | string | number } = {
  boolean: "1",
  date: minDate.split("T")[0],
  datetime: minDate,
  list: "-1",
  number: 0,
  string: " ",
  fallback: "0",
}

export default function getDefaultValue(type: string, operator: string) {
  type = type.toLowerCase();

  if (Object.hasOwn(Values, type)) {
    if (!["in", "not_in", "empty"].includes(operator)) {
      return Values[type];
    }

    if (operator === "empty") {
      return "1";
    }

    if (type === "number") {
      return {
        min: Number(Values[type]),
        max: Number(Values[type]),
      };
    }

    if (type === "datetime") {
      return {
        min: minDate,
        max: maxDate,
      };
    }

    return {
      min: String(Values[type]),
      max: String(Values[type]),
    };
  }

  return Values["fallback"];
}
